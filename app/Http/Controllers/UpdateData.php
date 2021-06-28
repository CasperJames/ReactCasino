<?php

namespace App\Http\Controllers;
use App\Http\Controllers\Controller;
use App\Http\Controllers\PlayerController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Session;
use App\Models\User;
use App\Models\Player;

class UpdateData extends Controller
{
	
	public function index() {
	
	}

	public function updateAllTheThings(Request $request) {
		Player::where('userId',$request['userIdData'])->update(['wallet'=>$request['playerWalletData'], 'handsPlayed'=>$request['playerHandsData'], 'wins'=>$request['playerWinsData'], 'losses'=>$request['playerLossesData'],]);
	}
}
