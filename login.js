document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    
    // Form Inputs
    const userIdInput = document.getElementById('userId');
    const passwordInput = document.getElementById('password');
    
    // Toggle Password Visibility
    const pwdToggleBtn = document.querySelector('.pwd-toggle');
    
    // Regex Patterns (Consistent with signup validation)
    const idRegex = /^[a-z0-9]{4,12}$/;

    // Toggle Password Visibility Logic
    pwdToggleBtn.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        // Toggle eye icon
        const icon = pwdToggleBtn.querySelector('i');
        if (type === 'text') {
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    });

    // Helper: Display validation states
    function setValidity(inputEl, isValid, errorMsg = '') {
        const groupEl = inputEl.closest('.input-group');
        const errorEl = groupEl.querySelector('.error-msg');
        
        if (isValid) {
            groupEl.classList.remove('invalid');
            groupEl.classList.add('valid');
            if (errorEl) errorEl.style.display = 'none';
        } else {
            groupEl.classList.remove('valid');
            groupEl.classList.add('invalid');
            if (errorEl) {
                if (errorMsg) errorEl.textContent = errorMsg;
                errorEl.style.display = 'flex';
            }
        }
        return isValid;
    }

    // --- Validation Rules ---

    // 1. ID Validation
    function validateUserId() {
        const value = userIdInput.value.trim();
        if (value === '') {
            return setValidity(userIdInput, false, '아이디를 입력해주세요.');
        }
        if (!idRegex.test(value)) {
            return setValidity(userIdInput, false, '아이디는 영문 소문자 및 숫자로 조합된 4~12자여야 합니다.');
        }
        return setValidity(userIdInput, true);
    }

    // 2. Password Validation
    function validatePassword() {
        const value = passwordInput.value;
        if (value === '') {
            return setValidity(passwordInput, false, '비밀번호를 입력해주세요.');
        }
        if (value.length < 8) {
            return setValidity(passwordInput, false, '비밀번호는 8자 이상이어야 합니다.');
        }
        return setValidity(passwordInput, true);
    }

    // --- Real-time Input Listeners ---
    userIdInput.addEventListener('input', validateUserId);
    passwordInput.addEventListener('input', validatePassword);

    // --- Form Submit Trigger ---
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Run validation rules
        const isIdValid = validateUserId();
        const isPwdValid = validatePassword();

        const formIsValid = isIdValid && isPwdValid;

        if (!formIsValid) {
            // Apply shake animation to invalid groups
            const invalidGroups = document.querySelectorAll('.input-group.invalid');
            invalidGroups.forEach(group => {
                group.classList.add('shake');
                setTimeout(() => group.classList.remove('shake'), 400);
            });

            // Scroll to the first invalid element
            const firstInvalid = document.querySelector('.invalid');
            if (firstInvalid) {
                firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        // Simulate Submission & Loader
        const submitBtn = document.getElementById('submitBtn');
        const originalBtnContent = submitBtn.innerHTML;
        
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i><span>로그인 중...</span>`;

        setTimeout(() => {
            // Restore submit button
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnContent;
            
            // Redirect to welcome page
            const userId = userIdInput.value.trim();
            window.location.href = `welcome.html?userId=${encodeURIComponent(userId)}`;
        }, 1500);
    });
});
