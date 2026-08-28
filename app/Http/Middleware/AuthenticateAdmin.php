<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

/**
 * Pastikan hanya admin (guard "admin") yang boleh akses panel /admin.
 * Bila belum login sebagai admin → lempar ke halaman login pemilih ("/").
 */
class AuthenticateAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! Auth::guard('admin')->check()) {
            return redirect('/');
        }

        return $next($request);
    }
}