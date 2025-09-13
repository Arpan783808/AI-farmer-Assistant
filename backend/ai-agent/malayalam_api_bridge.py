#!/usr/bin/env python3

import sys
import json
import argparse
import base64
import io
import tempfile
import os
from pathlib import Path

def main():
    parser = argparse.ArgumentParser(description='AI Farming Assistant Bridge')
    parser.add_argument('--audio-file', type=str, help='Path to audio file')
    parser.add_argument('--text', type=str, help='Text input')
    parser.add_argument('--image-file', type=str, help='Path to image file')
    parser.add_argument('--has_image', action='store_true', help='User has image context')
    
    args = parser.parse_args()
    
    try:
        user_message = ""
        has_audio_input = False
        has_image_input = False
        
        
        if args.audio_file:
            try:
                if not os.path.exists(args.audio_file):
                    raise FileNotFoundError(f"Audio file not found: {args.audio_file}")
                
                with open(args.audio_file, 'rb') as f:
                    audio_data = f.read()
                
                print(f"🎤 Processing audio file: {len(audio_data)} bytes", file=sys.stderr)
                
                if len(audio_data) == 0:
                    raise Exception("Audio file is empty")
                
                user_message = speech_to_text(audio_data)
                if not user_message or user_message.strip() == "":
                    print(json.dumps({
                        "success": False,
                        "error": "Could not transcribe audio. Please speak clearly and try again."
                    }))
                    return
                    
                has_audio_input = True
                print(f"🔤 Transcribed: '{user_message[:50]}...'", file=sys.stderr)
                
            except Exception as e:
                print(f"Audio processing error: {e}", file=sys.stderr)
                print(json.dumps({
                    "success": False,
                    "error": f"Audio processing failed: {str(e)}"
                }))
                return
                
      
        elif args.text:
            user_message = args.text.strip()
            print(f"📝 Text input received: '{user_message[:50]}...'", file=sys.stderr)
            
      
        if args.image_file:
            try:
                if not os.path.exists(args.image_file):
                    raise FileNotFoundError(f"Image file not found: {args.image_file}")
                
                
                has_image_input = True
                user_message = f"[User uploaded an image] {user_message}"
                print(f"🖼️ Image file processed: {args.image_file}", file=sys.stderr)
                
            except Exception as e:
                print(f"Image processing error: {e}", file=sys.stderr)
                
                
        elif args.has_image:
            has_image_input = True
            user_message = f"[User has an image] {user_message}"
        
       
        if not user_message or user_message.strip() == "":
            print(json.dumps({
                "success": False,
                "error": "No valid input provided"
            }))
            return
        
       
        try:
            from llm_pipeline import generate_malayalam_response
            ai_response = generate_malayalam_response(
                user_message, 
                has_image=has_image_input, 
                has_audio=has_audio_input
            )
            print(f"🤖 Generated response: '{ai_response[:50]}...'", file=sys.stderr)
            
        except Exception as e:
            print(f"LLM error: {e}", file=sys.stderr)
            ai_response = get_fallback_response(user_message)
        
     
        audio_base64 = None
        try:
            audio_base64 = text_to_speech(ai_response)
            if audio_base64:
                print(f"🎵 Generated TTS audio: {len(audio_base64)} chars", file=sys.stderr)
        except Exception as e:
            print(f"TTS error: {e}", file=sys.stderr)
        
      
        result = {
            "success": True,
            "transcribed_text": user_message if has_audio_input else None,
            "response_text": ai_response,
            "audio_base64": audio_base64,
            "input_types": {
                "audio": has_audio_input,
                "text": bool(args.text),
                "image": has_image_input
            }
        }
        
        print(json.dumps(result, ensure_ascii=False))
        
    except Exception as e:
        print(f"Bridge error: {e}", file=sys.stderr)
        print(json.dumps({
            "success": False,
            "error": f"Processing failed: {str(e)}"
        }))

def speech_to_text(audio_data):
  
    try:
        import openai
        
        # Save audio data to temporary file
        with tempfile.NamedTemporaryFile(suffix='.webm', delete=False) as temp_file:
            temp_file.write(audio_data)
            temp_file_path = temp_file.name
        
        try:
           
            with open(temp_file_path, 'rb') as audio_file:
                transcript = openai.Audio.transcribe(
                    "whisper-1",
                    audio_file,
                    language=None,  
                    temperature=0,  
                    prompt="This is a farming conversation in Malayalam, Hindi, or English about agriculture, crops, soil, fertilizers, or pest control."
                )
            return transcript.text.strip()
        finally:
          
            if os.path.exists(temp_file_path):
                os.unlink(temp_file_path)
                
    except ImportError:
        print("OpenAI not installed. Install with: pip install openai", file=sys.stderr)
        return None
    except Exception as e:
        print(f"Whisper API error: {e}", file=sys.stderr)
        return None
    
def clean_markdown_for_tts(text):
    """Remove markdown formatting for clean TTS speech"""
    import re
    
    # Remove bullet point asterisks
    text = re.sub(r'^\s*\*\s+', '', text, flags=re.MULTILINE)
    
    # Remove bold/italic asterisks
    text = re.sub(r'\*+([^*]+)\*+', r'\1', text)
    
    # Remove remaining standalone asterisks
    text = re.sub(r'\*', '', text)
    
    # Remove other markdown symbols
    text = re.sub(r'`([^`]+)`', r'\1', text)  # Remove code backticks
    text = re.sub(r'_([^_]+)_', r'\1', text)  # Remove underscores
    
    # Clean up multiple spaces/newlines
    text = re.sub(r'\n\s*\n', '\n', text)  # Remove empty lines
    text = re.sub(r'\s+', ' ', text)        # Normalize spaces
    
    return text.strip()
def text_to_speech(text):
   
    try:
        from gtts import gTTS
        import re
       

        clean_text = clean_markdown_for_tts(text)
        text_lower = text.lower()
        malayalam_chars = 'ഇഎഒഔകഖഗഘചഛജഝടഠഡഢണതഥദധനപഫബഭമയരറലളഴവശഷസഹാിീുൂൃെേൈൊോൗ്'
        hindi_chars = 'अआइईउऊएऐओऔकखगघङचछजझञटठडढणतथदधनपफबभमयरलवशषसहািীুূৃেৈোৌং্'
        
       
        if any(char in text for char in malayalam_chars):
            lang = 'ml'  # Malayalam
        elif any(char in text for char in hindi_chars):
            lang = 'hi' 
        else:
            lang = 'en'  # English
        
        print(f"🔊 Generating TTS in language: {lang}", file=sys.stderr)
        
        
        tts = gTTS(
            text=clean_text, 
            lang=lang, 
            slow=False,
            tld='co.in' if lang in ['hi', 'ml'] else 'com'  
        )
        
       
        audio_buffer = io.BytesIO()
        tts.write_to_fp(audio_buffer)
        audio_buffer.seek(0)
        
       
        audio_data = audio_buffer.read()
        return base64.b64encode(audio_data).decode()
        
    except ImportError:
        print("gTTS not installed. Install with: pip install gtts", file=sys.stderr)
        return None
    except Exception as e:
        print(f"TTS generation error: {e}", file=sys.stderr)
        return None

def get_fallback_response(user_message: str) -> str:
   
    malayalam_chars = 'ഇഎഒഔകഖഗഘചഛജഝടഠഡഢണതഥദധനപഫബഭമയരറലളഴവശഷസഹാിീുൂൃെേൈൊോൗ്'
    hindi_chars = 'अआइईउऊएऐओऔकखगघङचछजझञटठडढणतथदधनपফবভমযরলवशषসহািীুূৃেৈোৌং্'
    
    is_malayalam = any(char in user_message for char in malayalam_chars)
    is_hindi = any(char in user_message for char in hindi_chars)
    
    # Enhanced Malayalam responses
    if is_malayalam:
        if any(word in user_message.lower() for word in ['വള', 'fertilizer', 'ഉർവരക']):
            return "ഇപ്പോഴത്തെ കാലാവസ്ഥയ്ക്ക് അനുയോജ്യമായ വളങ്ങൾ: നെൽകൃഷിക്ക് നൈട്രജൻ, ഫോസ്ഫറസ്, പൊട്ടാഷ് എന്നിവയുടെ സമീകൃത മിശ്രിതം ഉപയോഗിക്കുക. മണ്ണിന്റെ pH 6.0-7.0 ആയിരിക്കണം."
        elif any(word in user_message.lower() for word in ['കാലാവസ്ഥ', 'weather', 'കാലാവസ്ഥ']):
            return "കാലാവസ്ഥാ മാറ്റങ്ങൾ കൃഷിയെ ബാധിക്കുന്നു. മഴക്കാലത്ത് വിതയ്ക്കലും വേനൽക്കാലത്ത് ജലസേചനവും ശ്രദ്ധിക്കുക. പ്രാദേശിക കാലാവസ്ഥാ വകുപ്പിനെ സമീപിക്കുക."
        else:
            return "നിങ്ങളുടെ കൃഷിയെക്കുറിച്ചുള്ള ചോദ്യത്തിന് സഹായിക്കാൻ ഞാൻ ഇവിടെയുണ്ട്. വിളകൾ, മണ്ണ്, വളങ്ങൾ, കീടനിയന്ത്രണം എന്നിവയെക്കുറിച്ച് കൂടുതൽ വിവരങ്ങൾ ചോദിക്കുക."
    
    # Enhanced Hindi responses  
    elif is_hindi:
        if any(word in user_message.lower() for word in ['खाद', 'उर्वरक', 'fertilizer']):
            return "फसल के लिए उर्वरक चुनते समय मिट्टी की जांच कराएं। नाइट्रोजन, फास्फोरस और पोटाश की संतुलित मात्रा का उपयोग करें। जैविक खाद भी मिलाएं।"
        else:
            return "मैं आपकी खेती संबंधी समस्याओं में मदद कर सकता हूँ। फसल, मिट्टी, उर्वरक, कीट नियंत्रण के बारे में पूछें। कृपया अधिक जानकारी दें।"
    
    # Enhanced English responses
    else:
        return "I'm your AI farming assistant! I can help with crops, soil management, fertilizers, pest control, weather planning, and sustainable farming practices. Please share your specific farming question."

if __name__ == "__main__":
    main()
