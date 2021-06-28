<?php
  
use Illuminate\Support\Facades\Route;  
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\UpdateData;

// Auth routes
Route::get('login', [AuthController::class, 'index'])->name('login');
Route::post('post-login', [AuthController::class, 'postLogin'])->name('login.post'); 
Route::get('registration', [AuthController::class, 'registration'])->name('register');
Route::post('post-registration', [AuthController::class, 'postRegistration'])->name('register.post'); 
Route::get('dashboard', [AuthController::class, 'dashboard']); 
Route::get('logout', [AuthController::class, 'logout'])->name('logout');

// All other routes
Route::get('/', function () {
    return view('dashboard');
});
Route::get('/about', function () { 
    return view('/about');
});
Route::post('/updatedata', 'App\Http\Controllers\UpdateData@updateAllTheThings');
