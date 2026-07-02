from openai import OpenAI
from openai import OpenAIError
from dotenv import load_dotenv
import os

load_dotenv()


class LazyLLMClient:
    def __init__(self):
        self._client = None

    def _get_client(self):
        if self._client is None:
            api_key = os.getenv("DASHSCOPE_API_KEY")
            if not api_key:
                raise OpenAIError(
                    "DASHSCOPE_API_KEY is not configured. "
                    "Set it in your .env file before calling AI features."
                )

            self._client = OpenAI(
                api_key=api_key,
                base_url="https://dashscope.aliyuncs.com/compatible-mode/v1"
            )

        return self._client

    def __getattr__(self, name):
        return getattr(self._get_client(), name)


client = LazyLLMClient()


def get_llm():
    return client
