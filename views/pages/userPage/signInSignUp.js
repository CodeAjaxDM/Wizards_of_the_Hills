document.addEventListener('DOMContentLoaded', function () {
    const signInLink = document.querySelector('#signin-link');
    const signUpLink = document.querySelector('#signup-link');
    const signInForm = document.querySelector('#signin');
    const signUpForm = document.querySelector('#signup');

    signInLink.addEventListener('click', function (e) {
        e.preventDefault();
        signInForm.style.display = 'block';
        signUpForm.style.display = 'none';
    });

    signUpLink.addEventListener('click', function (e) {
        e.preventDefault();
        signInForm.style.display = 'none';
        signUpForm.style.display = 'block';
    });
});