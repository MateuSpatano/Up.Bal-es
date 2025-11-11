<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AvailabilityController;
use App\Http\Controllers\Api\BlockedDateController;
use App\Http\Controllers\Api\BudgetController;
use App\Http\Controllers\Api\ClientBudgetController;
use App\Http\Controllers\Api\AccountController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\PortfolioController;
use App\Http\Controllers\Api\PublicContactController;
use App\Http\Controllers\PublicDecoratorController;
use App\Http\Controllers\Api\RegistrationController;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;
use Illuminate\Support\Facades\Route;

Route::middleware('web')
    ->withoutMiddleware(VerifyCsrfToken::class)
    ->prefix('auth')
    ->group(function (): void {
    Route::post('login', [AuthController::class, 'login']);
    Route::post('admin-login', [AuthController::class, 'adminLogin']);
    Route::post('logout', [AuthController::class, 'logout']);
    Route::post('admin-logout', [AuthController::class, 'adminLogout']);

    Route::get('check', [AuthController::class, 'checkAuth']);
    Route::get('check-admin', [AuthController::class, 'checkAdminAuth']);

    Route::post('password/reset-request', [AuthController::class, 'requestPasswordReset']);
    Route::post('password/validate-token', [AuthController::class, 'validateResetToken']);
    Route::post('password/set-new', [AuthController::class, 'setNewPassword']);

    Route::post('register', [RegistrationController::class, 'register']);
    Route::post('check-email', [RegistrationController::class, 'checkEmail']);
});

Route::middleware('web')
    ->withoutMiddleware(VerifyCsrfToken::class)
    ->prefix('admin')
    ->group(function (): void {
    Route::post('users', [AdminController::class, 'getUsers']);
    Route::post('user', [AdminController::class, 'getUser']);
    Route::post('user/update', [AdminController::class, 'updateUser']);
    Route::post('decorator/create', [AdminController::class, 'createDecorator']);
    Route::post('decorator/approve', [AdminController::class, 'approveDecorator']);
    Route::post('dashboard', [AdminController::class, 'dashboard']);
    Route::post('page/customization', [AdminController::class, 'getPageCustomization']);
    Route::post('page/customization/save', [AdminController::class, 'savePageCustomization']);
    Route::post('profile', [AdminController::class, 'getAdminProfile']);
    Route::post('profile/update', [AdminController::class, 'updateAdminProfile']);
    Route::post('profile/change-password', [AdminController::class, 'changeAdminPassword']);
});

Route::middleware('api')
    ->prefix('public')
    ->group(function (): void {
        Route::post('budgets', [ClientBudgetController::class, 'store']);
        Route::get('contacts', [PublicContactController::class, 'show']);
        Route::get('decorators/{slug}', [PublicDecoratorController::class, 'show']);
    });

Route::middleware('web')
    ->withoutMiddleware(VerifyCsrfToken::class)
    ->prefix('decorator')
    ->group(function (): void {
        Route::get('availability', [AvailabilityController::class, 'show']);
        Route::post('availability', [AvailabilityController::class, 'store']);
        Route::post('availability/validate', [AvailabilityController::class, 'validateSlot']);

        Route::get('blocked-dates', [BlockedDateController::class, 'index']);
        Route::post('blocked-dates', [BlockedDateController::class, 'store']);
        Route::delete('blocked-dates/{blockedDate}', [BlockedDateController::class, 'destroy']);
        Route::post('blocked-dates/check', [BlockedDateController::class, 'check']);

        Route::get('portfolio', [PortfolioController::class, 'index']);
        Route::post('portfolio', [PortfolioController::class, 'store']);
        Route::get('portfolio/{portfolioItem}', [PortfolioController::class, 'show']);
        Route::post('portfolio/{portfolioItem}', [PortfolioController::class, 'update']);
        Route::delete('portfolio/{portfolioItem}', [PortfolioController::class, 'destroy']);
        Route::delete('portfolio', [PortfolioController::class, 'clear']);

        Route::get('account', [AccountController::class, 'show']);
        Route::post('account', [AccountController::class, 'update']);
        Route::post('account/photo', [AccountController::class, 'updatePhoto']);
        Route::post('account/password', [AccountController::class, 'changePassword']);

        Route::prefix('dashboard')->group(function (): void {
            Route::post('summary', [DashboardController::class, 'summary']);
            Route::get('projects', [DashboardController::class, 'projects']);
            Route::get('projects/{budget}', [DashboardController::class, 'showProject']);
            Route::post('projects/{budget}/costs', [DashboardController::class, 'saveProjectCosts']);
        });

    Route::post('budgets/list', [BudgetController::class, 'list']);
    Route::post('budgets', [BudgetController::class, 'store']);
    Route::put('budgets/{budget}', [BudgetController::class, 'update']);
    Route::post('budgets/{budget}/status', [BudgetController::class, 'changeStatus']);
    Route::post('budgets/{budget}/send-email', [BudgetController::class, 'sendEmail']);
    Route::get('budgets/recent', [BudgetController::class, 'recent']);
});

