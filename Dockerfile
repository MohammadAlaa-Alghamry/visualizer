from python:3.8.5 

RUN python3 -m pip install --upgrade pip \
	&& pip install -r requirements.txt

ADD . /app

ENV FLASK_APP=application.py

CMD ['flask', 'run']

EXPOSE 8080
