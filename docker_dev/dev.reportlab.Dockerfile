FROM cwr_base:latest

# Install backend deps + reportlab
COPY ../backend/requirements.txt /app/
RUN pip3 install --no-cache-dir -r requirements.txt \
    && pip3 install reportlab

COPY ../backend /app/

EXPOSE 8001

CMD ["python3", "manage.py", "runserver", "0.0.0.0:8001"]
