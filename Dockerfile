from 	python:3.8-slim-buster 

WORKDIR /app

COPY 	requirements.txt requirements.txt

RUN	pip install -r requirements.txt

ENV 	FLASK_APP=application.py

COPY 	. .

CMD     [ "python3", "-m" , "flask", "run", "--host=0.0.0.0"]



