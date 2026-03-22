<?php
// ============================================================
// login.php — User Authentication (MySQL + Redis Session)
// ============================================================

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only accept POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

// --------------------------------------------------
// MySQL Connection
// --------------------------------------------------
$conn = new mysqli('localhost', 'root', '', 'user_auth_db');
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database connection failed']);
    exit();
}

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

// Read JSON body
$data = json_decode(file_get_contents('php://input'), true);

$email    = isset($data['email'])    ? trim($data['email'])    : '';
$password = isset($data['password']) ? $data['password']       : '';

// --------------------------------------------------
// Validation
// --------------------------------------------------
if (empty($email) || empty($password)) {
    echo json_encode(['success' => false, 'message' => 'Email and password are required']);
    exit();
}

// --------------------------------------------------
// Fetch user by email (Prepared Statement)
// --------------------------------------------------
$stmt = $conn->prepare('SELECT id, name, email, password FROM users WHERE email = ?');
$stmt->bind_param('s', $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(['success' => false, 'message' => 'Invalid email or password']);
    $stmt->close();
    $conn->close();
    exit();
}

$user = $result->fetch_assoc();
$stmt->close();
$conn->close();

// --------------------------------------------------
// Verify password
// --------------------------------------------------
if (!password_verify($password, $user['password'])) {
    echo json_encode(['success' => false, 'message' => 'Invalid email or password']);
    exit();
}

// --------------------------------------------------
// Create session token & store in Redis (1 hour TTL)
// --------------------------------------------------
$token = bin2hex(random_bytes(32));
$redis->setex('session:' . $token, 3600, $user['id']);

// --------------------------------------------------
// Return token & user info (exclude password)
// --------------------------------------------------
echo json_encode([
    'success' => true,
    'message' => 'Login successful',
    'token'   => $token,
    'user'    => [
        'id'    => $user['id'],
        'name'  => $user['name'],
        'email' => $user['email']
    ]
]);
