import os
import sys
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import ChatPromptTemplate

load_dotenv()

# Farming-specific prompt
prompt_farming = ChatPromptTemplate.from_messages([
    (
        "system",
        """You are a helpful Malayalam farming assistant AI. 
        Rules:
        - Always respond in Malayalam if the user writes in Malayalam
        - Provide practical, actionable farming advice
        - Focus on sustainable farming practices
        - Be encouraging and supportive to farmers""",
    ),
    (
        "human",
        "Farming question: {query_content}",
    ),
])

llm = ChatGoogleGenerativeAI(
    model="gemini-1.5-flash", 
    temperature=0.3
)

farming_chain = prompt_farming | llm

def generate_malayalam_response(user_message: str, has_image: bool = False, has_audio: bool = False) -> str:
    """Generate farming responses using Gemini API"""
    
    context = ""
    if has_image:
        context += "User uploaded an image. "
    if has_audio:
        context += "User sent audio. "
    
    full_query = f"{context}{user_message}"
    
    try:
        print(f"🤖 Calling Gemini API...", file=sys.stderr)
        response = farming_chain.invoke({"query_content": full_query})
        return response.content
    except Exception as e:
        print(f"❌ Gemini API error: {e}", file=sys.stderr)
        return "ക്ഷമിക്കണം, ഇപ്പോൾ സേവനം ലഭ്യമല്ല. ദയവായി പിന്നീട് ശ്രമിക്കുക."
