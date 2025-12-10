"""
Application Flask principale pour Chat to Notion
"""
from flask import Flask, jsonify
from flask_cors import CORS
from db import init_db
from routes.config_routes import config_bp
from routes.chat_routes import chat_bp

app = Flask(__name__)
CORS(app)

# Initialiser la base de données SQLite au démarrage
init_db()

# Enregistrer les blueprints
app.register_blueprint(config_bp)
app.register_blueprint(chat_bp)


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy"}), 200


if __name__ == '__main__':
    # WARNING: debug=True is for development only!
    # In production, set debug=False and use a production WSGI server like Gunicorn
    app.run(debug=True, host='0.0.0.0', port=5000)
