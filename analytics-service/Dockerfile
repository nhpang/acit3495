FROM python:3.9
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
RUN pip install flask pymongo mysql-connector-python
RUN pip install flask-cors
COPY . .
CMD ["python", "app.py"]
EXPOSE 6000
