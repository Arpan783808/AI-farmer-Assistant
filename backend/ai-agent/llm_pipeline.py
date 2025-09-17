import os
import sys
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import ChatPromptTemplate
from langchain.output_parsers import PydanticOutputParser
from pydantic import BaseModel, Field
 
from langchain_core.messages import HumanMessage
from langdetect import detect, DetectorFactory  
import base64
from typing import Optional
 
load_dotenv()
 
# Seed for consistent language detection
DetectorFactory.seed = 0
 
# Updated Pydantic model with confidence
class FarmingResponse(BaseModel):
    """The data structure for a farming query response."""
    title: str = Field(
        description="A short, concise title for the chat conversation, in 5 words or less. This should be in the same language as the user's query."
    )
    response: str = Field(
        description="The detailed, helpful, and practical response to the user's farming query. Use simple, engaging language. Start with encouragement if appropriate."
    )
    confidence: int = Field(
        description="Your confidence in the accuracy of this response (0-100). Base it on query clarity, your knowledge, and available context."
    )
 
# System prompt updated for user-friendliness, language, and confidence
system_prompt = """You are a helpful farming assistant AI focused on sustainable practices. 
Rules:
- Detect the language of the user's query (e.g., Malayalam, Hindi, English) and respond entirely in that language, including the title.
- Provide practical, actionable advice in an engaging, supportive way (e.g., "Great question! Here's how you can...").
- Use simple language, bullet points for steps, and be encouraging to farmers.
- If an image is provided, analyze it (e.g., identify crops, issues) and incorporate into your advice.
- Include a confidence score (0-100); if below 70, suggest asking for more details.
- Focus on crops, soil, fertilizers, pests, weather, and sustainability."""
 
llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash", temperature=0.3)
 
# Use with_structured_output for simplicity
structured_llm = llm.with_structured_output(FarmingResponse)
 
def generate_malayalam_response(
    user_message: str, has_image: bool = False, has_audio: bool = False, image_path: Optional[str] = None
) -> FarmingResponse:
    """
    Generate a structured farming response using Gemini. Supports multimodal image input.
    Returns a Pydantic object with 'title', 'response', and 'confidence'.
    """
    context = ""
    if has_audio:
        context += "User sent audio. "
    if has_image and not image_path:
        context += "User has image context. "
 
    full_query = f"{context}{user_message}"
 
    # Detect language
    try:
        detected_lang = detect(full_query)
        print(f"Detected language: {detected_lang}", file=sys.stderr)
    except Exception:
        detected_lang = "en"  # Fallback to English
        print("Language detection failed; defaulting to English.", file=sys.stderr)
 
    # Add language instruction to query
    full_query = f"Query language: {detected_lang}. {full_query}"
 
    try:
        print(f"🤖 Calling Gemini API for structured output...", file=sys.stderr)
        
        # Multimodal if image_path provided
        if image_path:
            with open(image_path, 'rb') as f:
                image_data = base64.b64encode(f.read()).decode('utf-8')
            message_content = [
                {"type": "text", "text": full_query},
                {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{image_data}"}},
            ]
            input_message = HumanMessage(content=message_content)
            response = structured_llm.invoke([input_message])
        else:
            response = structured_llm.invoke(full_query)
        
        # Normalize response to FarmingResponse so we can safely access attributes
        try:
            if isinstance(response, dict):
                response = FarmingResponse.parse_obj(response)
            else:
                # If it's a Pydantic BaseModel or has a dict() method, convert to dict first
                if hasattr(response, "dict"):
                    response = FarmingResponse.parse_obj(response.dict())
                else:
                    # Fallback: try to build dict from expected attributes
                    resp_dict = {}
                    for field in ("title", "response", "confidence"):
                        val = getattr(response, field, None)
                        if val is not None:
                            resp_dict[field] = val
                    response = FarmingResponse.parse_obj(resp_dict)
        except Exception:
            # If parsing fails, provide a safe fallback structured response
            fallback_title = {"ml": "പിശക്", "hi": "त्रुटि", "en": "Error"}.get(detected_lang, "Error")
            fallback_response = {"ml": "ക്ഷമിക്കണം, ലഭിച്ച პასუხം വിശകലനം ചെയ്യാൻ സാധിച്ചില്ല.",
                                 "hi": "क्षमा करें, प्राप्त उत्तर का विश्लेषण नहीं किया जा सका।",
                                 "en": "Sorry, the returned response could not be parsed."}.get(detected_lang, "Sorry, could not parse response.")
            return FarmingResponse(title=fallback_title, response=fallback_response, confidence=0)
        
        # Post-process: If low confidence, append suggestion (in same language)
        if response.confidence < 70:
            low_conf_msg = {
                "ml": "ഈ ഉത്തരം പൂർണ്ണമായി ഉറപ്പില്ല; കൂടുതൽ വിശദാംശങ്ങൾ നൽകിയാൽ മെച്ചപ്പെട്ട ഉപദേശം തരാം.",
                "hi": "यह उत्तर पूरी तरह से निश्चित नहीं है; अधिक विवरण दें तो बेहतर सलाह दे सकता हूं।",
                "en": "I'm not fully confident in this answer; provide more details for better advice."
            }.get(detected_lang, "Provide more details for better advice.")
            response.response += f"\n\n{low_conf_msg}"
        
        print(f"Confidence: {response.confidence}", file=sys.stderr)
        return response
    except Exception as e:
        print(f"❌ Gemini API error: {e}", file=sys.stderr)
        # Structured fallback
        fallback_title = {"ml": "പിശക്", "hi": "त्रुटि", "en": "Error"}.get(detected_lang, "Error")
        fallback_response = {"ml": "ക്ഷമിക്കണം, ഇപ്പോൾ സേവനം ലഭ്യമല്ല. ദയവായി പിന്നീട് ശ്രദ്ധിക്കുക.",
                             "hi": "क्षमा करें, सेवा उपलब्ध नहीं है। कृपया बाद में प्रयास करें।",
                             "en": "Sorry, service unavailable now. Please try later."}.get(detected_lang, "Sorry, try later.")
        return FarmingResponse(title=fallback_title, response=fallback_response, confidence=0)