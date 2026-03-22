// ============================================================
// profile.js — Profile Logic (jQuery AJAX + localStorage)
// ============================================================

$(document).ready(function () {

    // --------------------------------------------------
    // Session guard — redirect if not logged in
    // --------------------------------------------------
    var token = localStorage.getItem('auth_token');
    var user  = JSON.parse(localStorage.getItem('auth_user') || 'null');

    if (!token || !user) {
        window.location.href = 'login.html';
        return;
    }

    // --------------------------------------------------
    // Populate header from localStorage
    // --------------------------------------------------
    $('#profileName').text(user.name || 'User');
    $('#profileEmail').text(user.email || '');
    $('#profileAvatar').text((user.name || 'U').charAt(0).toUpperCase());

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
    // Helper: Toggle save button loading state
    // --------------------------------------------------
    function setSaveLoading(isLoading) {
        if (isLoading) {
            $('#btnSave').prop('disabled', true);
            $('#btnSaveText').html('<i class="bi bi-hourglass-split"></i> Saving...');
            $('#btnSaveSpinner').removeClass('d-none');
        } else {
            $('#btnSave').prop('disabled', false);
            $('#btnSaveText').html('<i class="bi bi-check-lg"></i> Save Profile');
            $('#btnSaveSpinner').addClass('d-none');
        }
    }

    // --------------------------------------------------
    // Load profile data from backend
    // --------------------------------------------------
    function loadProfile() {
        $.ajax({
            url: 'php/profile.php',
            type: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token
            },
            dataType: 'json',
            success: function (response) {
                if (response.success && response.profile) {
                    var p = response.profile;
                    $('#profileAge').val(p.age || '');
                    $('#profileDob').val(p.dob || '');
                    $('#profileContact').val(p.contact || '');
                    $('#profileGender').val(p.gender || '');
                    $('#profileAddress').val(p.address || '');
                    $('#profileBio').val(p.bio || '');
                }
            },
            error: function (xhr) {
                if (xhr.status === 401) {
                    // Session expired
                    localStorage.removeItem('auth_token');
                    localStorage.removeItem('auth_user');
                    window.location.href = 'login.html';
                } else {
                    showAlert('Failed to load profile.', 'danger');
                }
            }
        });
    }

    // Load on page ready
    loadProfile();

    // --------------------------------------------------
    // Save profile button click
    // --------------------------------------------------
    $('#btnSave').on('click', function () {
        var profileData = {
            age:     $.trim($('#profileAge').val()),
            dob:     $.trim($('#profileDob').val()),
            contact: $.trim($('#profileContact').val()),
            gender:  $('#profileGender').val() || '',
            address: $.trim($('#profileAddress').val()),
            bio:     $.trim($('#profileBio').val())
        };

        setSaveLoading(true);

        $.ajax({
            url: 'php/profile.php',
            type: 'POST',
            contentType: 'application/json',
            headers: {
                'Authorization': 'Bearer ' + token
            },
            data: JSON.stringify(profileData),
            dataType: 'json',
            success: function (response) {
                setSaveLoading(false);
                if (response.success) {
                    showAlert('Profile updated successfully!', 'success');
                } else {
                    showAlert(response.message || 'Update failed.', 'danger');
                }
            },
            error: function (xhr) {
                setSaveLoading(false);
                if (xhr.status === 401) {
                    localStorage.removeItem('auth_token');
                    localStorage.removeItem('auth_user');
                    window.location.href = 'login.html';
                } else {
                    showAlert('Server error. Please try again.', 'danger');
                }
            }
        });
    });

    // --------------------------------------------------
    // Logout button click
    // --------------------------------------------------
    $('#btnLogout').on('click', function () {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        window.location.href = 'login.html';
    });
});
