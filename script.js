document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signupForm');
    
    // Form Inputs
    const userIdInput = document.getElementById('userId');
    const passwordInput = document.getElementById('password');
    const passwordConfirmInput = document.getElementById('passwordConfirm');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const agreeTermsCheckbox = document.getElementById('agreeTerms');
    
    // Toggle Password Visibility
    const pwdToggleBtn = document.querySelector('.pwd-toggle');
    const pwdStrengthBar = document.querySelector('.pwd-strength-bar');
    const strengthFill = document.querySelector('.strength-fill');
    
    // Modal Elements
    const successModal = document.getElementById('successModal');
    const modalCloseBtn = document.getElementById('modalCloseBtn');
    const modalUserId = document.getElementById('modal-userId');
    const modalEmail = document.getElementById('modal-email');

    // Regex Patterns
    const idRegex = /^[a-z0-9]{4,12}$/;
    // Email regex: basic but robust pattern
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    // Phone regex: matches 010-XXXX-XXXX
    const phoneRegex = /^010-\d{4}-\d{4}$/;

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

    // Helper: Reset validation states
    function resetValidity(inputEl) {
        const groupEl = inputEl.closest('.input-group');
        const errorEl = groupEl.querySelector('.error-msg');
        groupEl.classList.remove('valid', 'invalid');
        if (errorEl) errorEl.style.display = 'none';
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

    // 2. Password Strength & Validation
    function validatePassword() {
        const value = passwordInput.value;
        pwdStrengthBar.style.display = 'block';

        if (value === '') {
            strengthFill.className = 'strength-fill';
            pwdStrengthBar.style.display = 'none';
            return setValidity(passwordInput, false, '비밀번호를 입력해주세요.');
        }

        // Calculate password strength
        let strengthScore = 0;
        if (value.length >= 8) strengthScore++;
        if (/[A-Za-z]/.test(value)) strengthScore++;
        if (/[0-9]/.test(value)) strengthScore++;
        if (/[^A-Za-z0-9]/.test(value)) strengthScore++;

        // Render strength meter
        if (strengthScore <= 2) {
            strengthFill.className = 'strength-fill weak';
        } else if (strengthScore === 3) {
            strengthFill.className = 'strength-fill medium';
        } else if (strengthScore >= 4) {
            strengthFill.className = 'strength-fill strong';
        }

        // Check validation (minimum requirements: 8+ chars, contains letters, numbers, and specials)
        const hasMinLen = value.length >= 8;
        const hasLetter = /[A-Za-z]/.test(value);
        const hasNumber = /[0-9]/.test(value);
        const hasSpecial = /[^A-Za-z0-9]/.test(value);

        if (!hasMinLen || !hasLetter || !hasNumber || !hasSpecial) {
            return setValidity(passwordInput, false, '비밀번호는 영문, 숫자, 특수문자를 조합하여 8자 이상이어야 합니다.');
        }

        return setValidity(passwordInput, true);
    }

    // 3. Password Confirm Validation
    function validatePasswordConfirm() {
        const passwordValue = passwordInput.value;
        const confirmValue = passwordConfirmInput.value;

        if (confirmValue === '') {
            return setValidity(passwordConfirmInput, false, '비밀번호 확인을 입력해주세요.');
        }
        if (passwordValue !== confirmValue) {
            return setValidity(passwordConfirmInput, false, '비밀번호가 일치하지 않습니다.');
        }
        return setValidity(passwordConfirmInput, true);
    }

    // 4. Email Validation
    function validateEmail() {
        const value = emailInput.value.trim();
        if (value === '') {
            return setValidity(emailInput, false, '이메일 주소를 입력해주세요.');
        }
        if (!emailRegex.test(value)) {
            return setValidity(emailInput, false, '올바른 이메일 형식(예: student@yju.ac.kr)이 아닙니다.');
        }
        return setValidity(emailInput, true);
    }

    // 5. Phone Number Auto-Formatting & Validation
    function formatAndValidatePhone(e) {
        let value = phoneInput.value.replace(/[^0-9]/g, ''); // Remove non-numeric characters
        
        // Auto hyphens injection (010-XXXX-XXXX style)
        let formatted = '';
        if (value.length < 4) {
            formatted = value;
        } else if (value.length < 7) {
            formatted = value.substr(0, 3) + '-' + value.substr(3);
        } else if (value.length < 11) {
            formatted = value.substr(0, 3) + '-' + value.substr(3, 3) + '-' + value.substr(6);
        } else {
            formatted = value.substr(0, 3) + '-' + value.substr(3, 4) + '-' + value.substr(7, 4);
        }
        
        phoneInput.value = formatted;

        // If this function is triggered via input event, validation updates in real-time
        if (e && e.type === 'input') {
            if (formatted === '') {
                resetValidity(phoneInput);
            } else if (phoneRegex.test(formatted)) {
                setValidity(phoneInput, true);
            }
        }
    }

    function validatePhone() {
        const value = phoneInput.value.trim();
        if (value === '') {
            return setValidity(phoneInput, false, '전화번호를 입력해주세요.');
        }
        if (!phoneRegex.test(value)) {
            return setValidity(phoneInput, false, '올바른 전화번호 형식(예: 010-1234-5678)이 아닙니다.');
        }
        return setValidity(phoneInput, true);
    }

    // 6. Terms Consent Validation
    function validateTerms() {
        const errorEl = document.getElementById('terms-error');
        if (!agreeTermsCheckbox.checked) {
            errorEl.style.display = 'block';
            return false;
        }
        errorEl.style.display = 'none';
        return true;
    }

    // --- Real-time Input Listeners ---
    userIdInput.addEventListener('input', validateUserId);
    passwordInput.addEventListener('input', () => {
        validatePassword();
        if (passwordConfirmInput.value !== '') {
            validatePasswordConfirm();
        }
    });
    passwordConfirmInput.addEventListener('input', validatePasswordConfirm);
    emailInput.addEventListener('input', validateEmail);
    phoneInput.addEventListener('input', formatAndValidatePhone);
    phoneInput.addEventListener('blur', validatePhone);
    agreeTermsCheckbox.addEventListener('change', validateTerms);

    // --- Form Submit Trigger ---
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Run validation rules
        const isIdValid = validateUserId();
        const isPwdValid = validatePassword();
        const isConfirmValid = validatePasswordConfirm();
        const isEmailValid = validateEmail();
        const isPhoneValid = validatePhone();
        const isTermsValid = validateTerms();

        const formIsValid = isIdValid && isPwdValid && isConfirmValid && isEmailValid && isPhoneValid && isTermsValid;

        if (!formIsValid) {
            // Apply shake animation to invalid groups
            const invalidGroups = document.querySelectorAll('.input-group.invalid');
            invalidGroups.forEach(group => {
                group.classList.add('shake');
                // Remove class after animation finishes so it can be re-triggered
                setTimeout(() => group.classList.remove('shake'), 400);
            });

            if (!isTermsValid) {
                const termsCont = document.querySelector('.terms-container');
                termsCont.classList.add('shake');
                setTimeout(() => termsCont.classList.remove('shake'), 400);
            }

            // Scroll to the first invalid element
            const firstInvalid = document.querySelector('.invalid, .terms-container');
            if (firstInvalid) {
                firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        // Simulate Submission & Loader
        const submitBtn = document.getElementById('submitBtn');
        const originalBtnContent = submitBtn.innerHTML;
        
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i><span>가입 요청 중...</span>`;

        setTimeout(() => {
            // Show Success Modal
            modalUserId.textContent = userIdInput.value.trim();
            modalEmail.textContent = emailInput.value.trim();
            
            successModal.classList.add('open');
            successModal.setAttribute('aria-hidden', 'false');

            // Restore submit button
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnContent;
        }, 1500);
    });

    // Redirect to the Welcome page when clicking the button
    modalCloseBtn.addEventListener('click', () => {
        const userId = userIdInput.value.trim();
        window.location.href = `welcome.html?userId=${encodeURIComponent(userId)}`;
    });
});
