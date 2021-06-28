@extends('layout')

@section('content')
<div class="container">
    <div class="row justify-content-center">
	<div class="col-md-4"></div>
	<div class="col-md-8">
	    <div class="row">
	        <div class="col-md-12">
		    <h1>Welcome {{ session()->get('username') ?? 'guest'}}!</h1>
		<div />
	    </div>
	    <div class="row">
	        <div class="col-md-12">
			<div id="divGame" name="divGame">
			    <script>
				let playerWalletPass = '{{ session()->get('playerWallet') }}';
				let playerHandsPass = '{{ session()->get('playerHands') }}';
				let playerWinsPass = '{{ session()->get('playerWins') }}';
				let playerLossesPass = '{{ session()->get('playerLosses') }}';
				let userIdPass = '{{ session()->get('userIdData') }}';
			    </script>
			</div>
		</div>
	    </div>
        </div>
    </div>
</div>
@endsection
