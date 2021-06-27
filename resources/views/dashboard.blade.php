@extends('layout')

@section('content')
<div class="container">
    <div class="row justify-content-center">
	<div class="col-md-4"></div>
	<div class="col-md-8">
	    <div class="row">
	        <div class="col-md-12">
	            <h1>Welcome {{ $user->name ?? 'guest'}}!</h1>
		<div />
	    </div>
	    <div class="row">
	        <div class="col-md-12">
			<div id="divGame" name="divGame">

			</div>
		</div>
	    </div>
        </div>
    </div>
</div>
@endsection
