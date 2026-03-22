// ============================================================
// register.js — Registration Logic (jQuery AJAX)
// ============================================================

$(document).ready(function () {

    // If already logged in, redirect to profile
    if (localStorage.getItem('auth_token')) {
        window.location.href = 'profile.html';
        return;
    }

    // --------------------------------------------------
    // Helper: Show alert message
    // --------------------------------------------------
    function showAlert(message, type) {
        var $alert = $('#alertMessage');
        $alert.removeClass('alert-success alert-danger')
              .addClass('alert-' + type)
              .text(message)
              .fadeIn(300);

        // Auto-hide after 5 seconds
        setTimeout(function () {
            $alert.fadeOut(300);
        }, 5000);
    }

    // --------------------------------------------------
    // Helper: Toggle button loading state
    // --------------------------------------------------
    function setLoading(isLoading) {
        if (isLoading) {
            $('#btnRegister').prop('disabled', true);
            $('#btnText').text('Registering...');
            $('#btnSpinner').removeClass('d-none');
        } else {
            $('#btnRegister').prop('disabled', false);
            $('#btnText').text('Register');
            $('#btnSpinner').addClass('d-none');
        }
    }

    // --------------------------------------------------
    // Register button click
    // --------------------------------------------------
    $('#btnRegister').on('click', function () {
        var name            = $.trim($('#regName').val());
        var email           = $.trim($('#regEmail').val());
        var password        = $('#regPassword').val();
        var confirmPassword = $('#regConfirmPassword').val();

        // Client-side validation
        if (!name || !email || !password || !confirmPassword) {
            showAlert('Please fill in all fields.', 'danger');
            return;
        }

        if (password.length < 6) {
            showAlert('Password must be at least 6 characters.', 'danger');
            return;
        }

        if (password !== confirmPassword) {
            showAlert('Passwords do not match.', 'danger');
            return;
        }

        // Send AJAX request
        setLoading(true);

        $.ajax({
            url: 'php/register.php',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                name: name,
                email: email,
                password: password
            }),
            dataType: 'json',
            success: function (response) {
                setLoading(false);
                if (response.success) {
                    showAlert('Registration successful! Redirecting to login...', 'success');
                    setTimeout(function () {
                        window.location.href = 'login.html';
                    }, 1500);
                } else {
                    showAlert(response.message || 'Registration failed.', 'danger');
                }
            },
            error: function (xhr) {
                setLoading(false);
                var msg = 'Server error. Please try again.';
                try {
                    var resp = JSON.parse(xhr.responseText);
                    if (resp.message) msg = resp.message;
                } catch (e) {}
                showAlert(msg, 'danger');
            }
        });
    });

    // Allow Enter key to trigger register
    $('#registerForm input').on('keypress', function (e) {
        if (e.which === 13) {
            $('#btnRegister').click();
        }
    });
});
