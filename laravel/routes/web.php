<?php

use App\Http\Controllers\PublicDecoratorController;
use Illuminate\Support\Facades\Route;

Route::view('/', 'legacy.login')->name('login');
Route::view('/login', 'legacy.login');
Route::view('/cadastro', 'legacy.cadastro')->name('cadastro');
Route::view('/admin/login', 'legacy.admin-login')->name('admin.login');
Route::view('/admin/painel', 'legacy.admin')->name('admin.dashboard');
Route::view('/painel-decorador', 'legacy.painel-decorador')->name('painel.decorador');
Route::view('/reset-password', 'legacy.reset-password')->name('password.reset');
Route::view('/solicitacao-cliente', 'legacy.solicitacao-cliente')->name('solicitacao.cliente');
Route::get('/decorador/{slug}', [PublicDecoratorController::class, 'page'])->name('decorator.page');
