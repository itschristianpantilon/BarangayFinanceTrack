from app import create_app
from app.run_tests import run_tests

app = create_app()

if __name__ == "__main__":
    run_tests()
    app.run(debug=True)
