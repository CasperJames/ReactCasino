<?php
  
namespace App\Http\Controllers\Auth;
  
use App\Http\Controllers\Controller;
use App\Http\Controllers\PlayerController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Session;
use App\Models\User;
use App\Models\Player;
use Hash;
  
class AuthController extends Controller
{
    /**
     * Write code on Method
     *
     * @return response()
     */
    public function index()
    {
        return view('auth.login');
    }  
      
    /**
     * Write code on Method
     *
     * @return response()
     */
    public function registration()
    {
        return view('auth.registration');
    }
      
    /**
     * Write code on Method
     *
     * @return response()
     */
    public function postLogin(Request $request)
    {
        $request->validate([
            'email' => 'required',
            'password' => 'required',
        ]);
   
        $credentials = $request->only('email', 'password');
	if (Auth::attempt($credentials)) {
	    Session::put('username',Auth::user()->name);
	    $profileInfo = $this->getPlayerProfile(Auth::user()->id);
            return redirect()->intended('dashboard')
                        ->withSuccess('You have Successfully loggedin');
        }
  
        return redirect("login")->withSuccess('Oops! You have entered invalid credentials');
    }

    /**
     *
     */
    private function getPlayerProfile($data) {
	$wallet = Player::where('userId', $data)->value('wallet');
	$handsPlayed = Player::where('userId', $data)->value('handsPlayed');
	$wins = Player::where('userId', $data)->value('wins');
	$losses = Player::where('userId', $data)->value('losses');
	Session::put('userIdData',$data);
	Session::put('playerWallet', $wallet);
	Session::put('playerHands', $handsPlayed);
	Session::put('playerWins', $wins);
	Session::put('playerLosses', $losses);
	
    }

    /**
     * Write code on Method
     *
     * @return response()
     */
    public function postRegistration(Request $request)
    {  
        $request->validate([
            'name' => 'required',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6',
        ]);
           
        $data = $request->all();
        $check = $this->create($data);
        $profile = $this->createPlayerProfile($check); 
        return redirect("dashboard")->withSuccess('Great! You have Successfully loggedin');
    }
    
    /**
     * Write code on Method
     *
     * @return response()
     */
    public function dashboard()
    {
	if(Auth::check()){
	    $user = \Auth::user();
            return view('dashboard',['user' => $user]);
        }
  
        return redirect("login")->withSuccess('Opps! You do not have access');
    }
    
    /**
     * Write code on Method
     *
     * @return response()
     */
    public function create(array $data)
    {
      return User::create([
        'name' => $data['name'],
        'email' => $data['email'],
        'password' => Hash::make($data['password'])
      ]);
    }

    /**
     *
     */
    private function createPlayerProfile($check) {
      if($check) {
	$uId = User::max('id');
      	return Player::create([
          'userId' => $uId,
          'wallet' => 1000,
          'handsPlayed' => 0,
          'wins' => 0,
          'losses' => 0
        ]);
      }
      return null;
    }

    /**
     * Write code on Method
     *
     * @return response()
     */
    public function logout() {
        Session::flush();
        Auth::logout();
  
        return Redirect('login');
    }
}
