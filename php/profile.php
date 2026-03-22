<?php
// ============================================================
// profile.php — User Profile CRUD (MongoDB + Redis Auth)
// ============================================================

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// --------------------------------------------------
// Load MongoDB Library
// --------------------------------------------------
require_once __DIR__ . '/../vendor/autoload.php';

// --------------------------------------------------
// Redis Connection
// --------------------------------------------------
$redis = new Redis();
try {
    $redis->connect('127.0.0.1', 6379);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Redis connection failed']);
    exit();
}

// --------------------------------------------------
// Extract Bearer token from Authorization header
// --------------------------------------------------
function getBearerToken() {
    $headers = '';
    if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $headers = $_SERVER['HTTP_AUTHORIZATION'];
    } elseif (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        $headers = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
    } elseif (function_exists('apache_request_headers')) {
        $allHeaders = apache_request_headers();
        if (isset($allHeaders['Authorization'])) {
            $headers = $allHeaders['Authorization'];
        }
    }
    if (preg_match('/Bearer\s(\S+)/', $headers, $matches)) {
        return $matches[1];
    }
    return null;
}

// --------------------------------------------------
// Authenticate via Bearer token → Redis
// --------------------------------------------------
$token = getBearerToken();

if (empty($token)) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized. Please login again.']);
    exit();
}

$userId = $redis->get('session:' . $token);

if (!$userId) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized. Please login again.']);
    exit();
}

// --------------------------------------------------
// MongoDB Connection
// --------------------------------------------------
try {
    $mongoClient = new MongoDB\Client('mongodb://localhost:27017');
    $collection  = $mongoClient->selectDatabase('user_profile_db')->selectCollection('profiles');
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'MongoDB connection failed']);
    exit();
}

// --------------------------------------------------
// GET — Fetch profile
// --------------------------------------------------
if ($_SERVER['REQUEST_METHOD'] === 'GET') {

    $profile = $collection->findOne(['user_id' => (string) $userId]);

    if ($profile) {
        echo json_encode([
            'success' => true,
            'profile' => [
                'user_id' => $profile['user_id'],
                'age'     => isset($profile['age'])     ? $profile['age']     : '',
                'dob'     => isset($profile['dob'])     ? $profile['dob']     : '',
                'contact' => isset($profile['contact']) ? $profile['contact'] : '',
                'address' => isset($profile['address']) ? $profile['address'] : '',
                'bio'     => isset($profile['bio'])     ? $profile['bio']     : '',
                'gender'  => isset($profile['gender'])  ? $profile['gender']  : ''
            ]
        ]);
    } else {
        echo json_encode([
            'success' => true,
            'profile' => [
                'user_id' => (string) $userId,
                'age'     => '',
                'dob'     => '',
                'contact' => '',
                'address' => '',
                'bio'     => '',
                'gender'  => ''
            ]
        ]);
    }
    exit();
}

// --------------------------------------------------
// POST — Create / Update profile
// --------------------------------------------------
if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $data = json_decode(file_get_contents('php://input'), true);

    $profileData = [
        'user_id' => (string) $userId,
        'age'     => isset($data['age'])     ? trim($data['age'])     : '',
        'dob'     => isset($data['dob'])     ? trim($data['dob'])     : '',
        'contact' => isset($data['contact']) ? trim($data['contact']) : '',
        'address' => isset($data['address']) ? trim($data['address']) : '',
        'bio'     => isset($data['bio'])     ? trim($data['bio'])     : '',
        'gender'  => isset($data['gender'])  ? trim($data['gender'])  : '',
        'updated_at' => date('Y-m-d H:i:s')
    ];

    $result = $collection->updateOne(
        ['user_id' => (string) $userId],
        ['$set' => $profileData],
        ['upsert' => true]
    );

    echo json_encode([
        'success' => true,
        'message' => 'Profile updated successfully',
        'profile' => $profileData
    ]);
    exit();
}

// --------------------------------------------------
// Method not allowed
// --------------------------------------------------
http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Method not allowed']);
