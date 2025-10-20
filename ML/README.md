To use the Ollama LLM you must download Ollama on your device
Then open command
if server isnt running run this command:
ollama serve

by default it will start a local HTTP API at:
http://127.0.0.1:11434

you will need to pull models but ensure you have enough space in memory for their sizes:
ollama pull mistral:latest
ollama pull mxbai-embed-large

now just run the python file:

if you need to access endpoints: 
/tbd
