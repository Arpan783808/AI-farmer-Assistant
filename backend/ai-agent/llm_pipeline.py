import os
import sys
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import ChatPromptTemplate
from langchain.output_parsers import PydanticOutputParser
from pydantic import BaseModel, Field

load_dotenv()


# 1. Define the desired data structure using Pydantic
class FarmingResponse(BaseModel):
    """The data structure for a farming query response."""

    title: str = Field(
        description="A short, concise title for the chat conversation, in 5 words or less. This should be in the same language as the user's query."
    )
    response: str = Field(
        description="The detailed, helpful, and practical response to the user's farming query."
    )


# 2. Create an output parser
output_parser = PydanticOutputParser(pydantic_object=FarmingResponse)

# 3. Update the prompt to include format instructions
prompt_farming = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            """You are a helpful Malayalam farming assistant AI. 
        Rules:
        - Always respond in Malayalam if the user writes in Malayalam.
        - Generate both a concise title and a detailed response for the user's query.
        - Provide practical, actionable farming advice.
        - Focus on sustainable farming practices.
        - Be encouraging and supportive to farmers.""",
        ),
        (
            "human",
            """{format_instructions}
        
        Farming question: {query_content}""",
        ),
    ]
)

llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash", temperature=0.3)

# 4. Rebuild the chain to include the output parser
farming_chain = prompt_farming | llm | output_parser


def generate_malayalam_response(
    user_message: str, has_image: bool = False, has_audio: bool = False
) -> FarmingResponse:
    """
    Generate a structured farming response (title and content) using the Gemini API.
    Returns a Pydantic object with 'title' and 'response' attributes.
    """

    context = ""
    if has_image:
        context += "User uploaded an image. "
    if has_audio:
        context += "User sent audio. "

    full_query = f"{context}{user_message}"

    try:
        print(f"🤖 Calling Gemini API for structured output...", file=sys.stderr)
        response = farming_chain.invoke(
            {
                "query_content": full_query,
                "format_instructions": output_parser.get_format_instructions(),
            }
        )
        return response
    except Exception as e:
        print(f"❌ Gemini API error: {e}", file=sys.stderr)
        # Return a default structured response on error
        return FarmingResponse(
            title="പിശക്",
            response="ക്ഷമിക്കണം, ഇപ്പോൾ സേവനം ലഭ്യമല്ല. ദയവായി പിന്നീട് ശ്രമിക്കുക.",
        )
