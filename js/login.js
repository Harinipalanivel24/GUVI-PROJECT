// ============================================================
// login.js — Login Logic (jQuery AJAX + localStorage)
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

        setTimeout(function () {
            $alert.fadeOut(300);
        }, 5000);
    }

    // --------------------------------------------------
    // Helper: Toggle button loading state
    // --------------------------------------------------
    function setLoading(isLoading) {
        if (isLoading) {
            $('#btnLogin').prop('disabled', true);
            $('#btnText').text('Logging in...');
            $('#btnSpinner').removeClass('d-none');
        } else {
            $('#btnLogin').prop('disabled', false);
            $('#btnText').text('Login');
            $('#btnSpinner').addClass('d-none');
        }
    }

    // --------------------------------------------------
    // Login button click
    // --------------------------------------------------
    $('#btnLogin').on('click', function () {
        var email    = $.trim($('#loginEmail').val());
        var password = $('#loginPassword').val();

        // Client-side validation
        if (!email || !password) {
            showAlert('Please enter both email and password.', 'danger');
            return;
        }

        // Send AJAX request
        setLoading(true);

        $.ajax({
            url: 'php/login.php',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                email: email,
                password: password
            }),
            dataType: 'json',
            success: function (response) {
                setLoading(false);
                if (response.success) {
                    // Store token and user info in localStorage
                    localStorage.setItem('auth_token', response.token);
                    localStorage.setItem('auth_user', JSON.stringify(response.user));

                    showAlert('Login successful! Redirecting...', 'success');
                    setTimeout(function () {
                        window.location.href = 'profile.html';
                    }, 1000);
                } else {
                    showAlert(response.message || 'Login failed.', 'danger');
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

    // Allow Enter key to trigger login
    $('#loginForm input').on('keypress', function (e) {
        if (e.which === 13) {
            $('#btnLogin').click();
        }
    });
});
