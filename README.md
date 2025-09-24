# Meet4Me

Summarize meeting videos recorded from sharing screen browser tab.

## Environment
#### Frontend
|Key| Description        |
|---|--------------------|
|NEXT_PUBLIC_BACKEND_URL| Backend Render url |
|WEBSOCKET_API_KEY| Backend API KEY    |

#### Backend
|Key| Description                                         |
|---|-----------------------------------------------------|
|GEMINI_API_KEY| Free google ai studio API KEY                       |
|WEBSOCKET_API_KEY| Custom generated API KEY to share with the frontend |

## Gemini setup
#### Prompt transcription
Create `backend/geminiPromptTranscription.txt` with your prompt, something like:
```txt
Transcribe the content of this video word for word.
Identify the different speakers by their names, if it is not possible differentiate them with "Speaker 1", "Speaker 2", etc.
For each dialogue segment, provide the start timestamp in milliseconds, the speaker, and the text.
Generate the output EXACTLY in the required JSON format.
```
#### Prompt summary
Create `backend/geminiPromptSummary.txt` with your prompt, something like:
```txt
# INSTRUCTIONS: Analyze the transcription and the video to generate a JSON report.

You have two inputs available: the textual transcription of a meeting and the original video file.
Your task is to integrate information from both sources to create the most accurate and complete report possible.
Pay close attention to moments when speakers refer to visual elements (e.g., "as you can see on this slide," "this chart shows...," "look here"). Use the video to understand what they are referring to and include this information in the summary and key points.
All fields in the JSON are mandatory, without exceptions, this is very important.
The output must be in English.

TRANSCRIPTION:
---
%TRANSCRIPTION%
---

INSTRUCTIONS FOR THE JSON FIELDS:
- title: Create a short and descriptive title for the meeting.
- summary: Write a summary of a maximum of 150 words. Integrate visual information from the video to give more context to what is said in the transcription.
- keyPoints: Extract 3 to 5 key points. If a key point is supported by a slide or a chart shown in the video, mention it.
- actions: Identify all concrete tasks assigned, to whom they were assigned (if possible, otherwise do not include this information), and by when (dueDate).
```

#### System instructions
Create `backend/geminiSystemInstructions.txt` with your prompt, something like:
```txt
You are a text processing API.
Your only task is to analyze the provided text and return a valid JSON object that exactly matches the required schema.
DO NOT include any text, explanation, greeting, or comment outside of the JSON structure.
Your response must begin with '{' and end with '}'.
```

## Dev
#### Icons
Icon list can be found [here](https://phosphoricons.com/).
