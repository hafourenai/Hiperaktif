from flask import Flask, render_template, jsonify
import os

# Dapatkan path absolute untuk template dan static folder
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
TEMPLATE_DIR = os.path.join(BASE_DIR, 'templates')
STATIC_DIR = os.path.join(BASE_DIR, 'static')

# Buat Flask app dengan path explicit
app = Flask(__name__, 
            template_folder=TEMPLATE_DIR,
            static_folder=STATIC_DIR)

# Print untuk debug
print(f"Base Directory: {BASE_DIR}")
print(f"Template Directory: {TEMPLATE_DIR}")
print(f"Static Directory: {STATIC_DIR}")

# Route halaman utama
@app.route('/')
def index():
    return render_template('index.html')


# Route halaman matematika
@app.route('/math')
def math():
    return render_template('math.html')

# Route halaman membaca
@app.route('/reading')
def reading():
    return render_template('reading.html')

# Route halaman daftar game
@app.route('/games')
def games():
    games_folder = os.path.join(app.static_folder, 'games')
    game_list = []
    
    if os.path.exists(games_folder):
        for folder_name in os.listdir(games_folder):
            folder_path = os.path.join(games_folder, folder_name)
            if os.path.isdir(folder_path):
                index_path = os.path.join(folder_path, 'index.html')
                if os.path.exists(index_path):
                    game_list.append({
                        'name': folder_name.replace('_', ' ').title(),
                        'folder': folder_name,
                        'url': f'/static/games/{folder_name}/index.html'
                    })
    
    return render_template('games.html', games=game_list)

# API untuk generate soal matematika
@app.route('/api/math/generate')
def generate_math():
    import random
    
    num1 = random.randint(1, 10)
    num2 = random.randint(1, 10)
    operation = random.choice(['+', '-'])
    
    if operation == '+':
        answer = num1 + num2
    else:
        if num1 < num2:
            num1, num2 = num2, num1
        answer = num1 - num2
    
    return jsonify({
        'num1': num1,
        'num2': num2,
        'operation': operation,
        'answer': answer
    })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5050)