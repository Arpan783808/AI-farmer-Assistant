#!/usr/bin/env python3

import sys
import json
import argparse
import base64
import io
import tempfile
import os
from pathlib import Path
from dotenv import load_dotenv
script_dir = Path(__file__).resolve().parent
env_path = script_dir / '.env'
load_dotenv(dotenv_path=env_path)




load_dotenv()

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
            response_text = ""
            title_text = ""
            if hasattr(ai_response, 'response'):
                response_text = str(ai_response.response)
            if hasattr(ai_response, 'title'):
                title_text = str(ai_response.title)

            if not response_text:
                if isinstance(ai_response, str):
                    response_text = ai_response
                elif isinstance(ai_response, dict):
                    response_text = str(ai_response.get('response', ''))
                    title_text = str(ai_response.get('title', ''))
                else:
                    response_text = str(ai_response)
            
            preview = response_text[:50] + "..." if len(response_text) > 50 else response_text
            print(f"🤖 LLM response: '{preview}'", file=sys.stderr)
            
        except Exception as e:
            print(f"LLM error: {e}", file=sys.stderr)
            response_text = get_fallback_response(user_message)  
            title_text = "Farming Help"
            print(f"Fallback response: '{response_text[:50]}...'", file=sys.stderr)
        
     
        audio_base64 = None
        try:
            audio_base64 = text_to_speech(response_text)
            if audio_base64:
                print(f"🎵 Generated TTS audio: {len(audio_base64)} chars", file=sys.stderr)
        except Exception as e:
            print(f"TTS error: {e}", file=sys.stderr)
        
      
        result = {
            "success": True,
            "transcribed_text": user_message if has_audio_input else None,
            "title": title_text,
            "response_text": response_text,
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
        try:
            import openai
        except ImportError:
            print("OpenAI not installed. Install with: pip install openai", file=sys.stderr)
            return None
        
        api_key = os.getenv('OPENAI_API_KEY')
        if not api_key:
            print("OPENAI_API_KEY not found in environment variables", file=sys.stderr)
            return None
        openai.api_key = api_key

        try:
            client = openai.OpenAI(api_key=api_key)
        except AttributeError:
            # Fallback for older OpenAI versions
            client = None
        # Save audio data to temporary file
        with tempfile.NamedTemporaryFile(suffix='.webm', delete=False) as temp_file:
            temp_file.write(audio_data)
            temp_file_path = temp_file.name
        
        try:
           
           with open(temp_file_path, 'rb') as audio_file:
                if client:  # New API version
                    transcript = client.audio.transcriptions.create(
                        model="whisper-1",
                        file=audio_file,
                        temperature=0,
                        prompt="This is a farming conversation in Malayalam, Hindi, or English about agriculture, crops, soil, fertilizers, or pest control."
                    )
                    return transcript.text.strip()
                else:  # Old API version or SDK missing helper
                    # Prefer SDK method if available, otherwise call the REST endpoint directly, do not change it!
                    prompt_text = "This is a farming conversation in Malayalam, Hindi, or English about agriculture, crops, soil, fertilizers, or pest control."
                    # Use getattr to safely retrieve the Audio attribute to avoid static analysis errors, better in this case!, do not use openai.Audio, will give errors!
                    audio_module = getattr(openai, "Audio", None)
                    if audio_module and hasattr(audio_module, "transcribe"):
                        transcribe_fn = getattr(audio_module, "transcribe")
                        transcript = transcribe_fn(
                            "whisper-1",
                            audio_file,
                            temperature=0,
                            prompt=prompt_text
                        )
                        # Some SDKs return an object with .text, some return a dict
                        if hasattr(transcript, "text"):
                            return transcript.text.strip()
                        elif isinstance(transcript, dict) and "text" in transcript:
                            return transcript["text"].strip()
                        else:
                            return str(transcript).strip()
                    else:
                        # Fallback: call the HTTP API directly (works regardless of installed SDK)
                        try:
                            import requests
                        except ImportError:
                            raise Exception("requests not installed; install with: pip install requests")
                        audio_file.seek(0)
                        headers = {
                            "Authorization": f"Bearer {api_key}"
                        }
                        files = {
                            "file": ("audio.webm", audio_file, "application/octet-stream")
                        }
                        data = {
                            "model": "whisper-1",
                            "temperature": 0,
                            "prompt": prompt_text
                        }
                        resp = requests.post("https://api.openai.com/v1/audio/transcriptions", headers=headers, files=files, data=data)
                        resp.raise_for_status()
                        j = resp.json()
                        return j.get("text", "").strip()
        finally:
          
            if os.path.exists(temp_file_path):
                os.unlink(temp_file_path)
                
    except ImportError:
        print("OpenAI not installed. Install with: pip install openai", file=sys.stderr)
        return None
    except Exception as e:
        print(f"OpenAI Whisper failed: {e}, trying local Whisper...", file=sys.stderr)
        try:
            import whisper
            
            # Save audio to temp file
            with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as temp_file:
                temp_file.write(audio_data)
                temp_file_path = temp_file.name
            
            try:
                # Load model (downloads on first use)
                model = whisper.load_model("base")
                result = model.transcribe(temp_file_path, language="ml")
                # Normalize different possible return formats into a single string.
                text_val = ""
                if isinstance(result, dict):
                    if "text" in result:
                        text_field = result["text"]
                        if isinstance(text_field, list):
                            # Join list parts into a single string
                            text_val = " ".join(part if isinstance(part, str) else str(part) for part in text_field)
                        elif isinstance(text_field, str):
                            text_val = text_field
                        else:
                            text_val = str(text_field)
                    elif "segments" in result and isinstance(result["segments"], list):
                        # Some transcribers return segments with text fields
                        parts = []
                        for seg in result["segments"]:
                            t = seg.get("text", "")
                            if isinstance(t, str):
                                parts.append(t)
                            else:
                                parts.append(str(t))
                        text_val = " ".join(parts)
                    else:
                        text_val = str(result)
                else:
                    # Fallback when result is not a dict
                    text_val = str(result)
                return text_val.strip()
            finally:
                if os.path.exists(temp_file_path):
                    os.unlink(temp_file_path)
        except ImportError:
                print("Local Whisper not available. Install with: pip install openai-whisper", file=sys.stderr)
                return None
        except Exception as e:
            print(f"Local Whisper error: {e}", file=sys.stderr)
            return None
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
