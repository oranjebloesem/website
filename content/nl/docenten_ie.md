---
layout: page
permalink: /docenten_ie/
title: Informatie & documenten voor docenten
tagline: 
tags: 
modified: 1-4-2016
comments: false
---



In de onderstaande folders is het onderwijsmateriaal voor de Oranjebloesem te vinden.
<link rel="stylesheet" href="http://ajax.googleapis.com/ajax/libs/jqueryui/1/themes/smoothness/jquery-ui.css">
<script src="//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js"></script>
<script src="//malsup.github.io/jquery.blockUI.js"></script>

<script src="//sdk.amazonaws.com/js/aws-sdk-2.1.28.min.js"></script>
<link rel="stylesheet" type="text/css" href="/assets/css/theme.css">
<script src="/assets/js/config_docent.js"></script>	
<script src="/assets/js/s3bb_docent.js"></script>	


<div id="overlay"></div>
<div id="maincontent">
    <div id="header">
        <div id="subheader">
            <div id="status"></div>
        </div>
        <div id="breadcrumb" class="breadcrumb"></div> 
    </div>
    <div id="contents">
        <div id="elements">
            <ul id="objects"></ul>
        </div>
    </div>
</div>
<div id="loginbox" style="display:none">
    <div id="info">
      Login
    </div>
            <p><label>Username:</label><input type="text" id="email" size="20"/></p>
            <p><label>Password:</label><input type="password" id="password" size="20" /></p>
            <button type="submit" id="login-button">Login</button>
</div>
        
        

<script>

  var email = document.getElementById('email');
  var password = document.getElementById('password');
  var loginButton = document.getElementById('login-button');
  loginButton.addEventListener('click', function() {
    info.innerHTML = 'Login...';
    if (email.value == null || email.value == '') {
      info.innerHTML = 'Please specify your email address.';
    } else if (password.value == null || password.value == '') {
      info.innerHTML = 'Please specify a password.';
    } else {
      var input = {
        email: email.value,
        password: password.value,
        verified: true,
        realm:'docent'
      };
      
      
   AWS.config = new AWS.Config();
   AWS.config.region = AWS_Region;
   AWS.config.credentials = new AWS.CognitoIdentityCredentials({
       IdentityPoolId: 'us-east-1:56af2b09-f6cd-4254-b15f-128537f117e1'
    });
   AWS.config.credentials.refresh();
   var lambda = new AWS.Lambda();
   lambda.invoke({
        FunctionName: 'LambdAuthLogin',
        Payload: JSON.stringify(input)
    }, function(err, data) {
        if (err) {
            console.log(err, err.stack);
            info.innerHTML = '<b>Not</b> logged in';
        }
        else {
          var output = JSON.parse(data.Payload);
          if (!output.login) {
            info.innerHTML = '<b>Not</b> logged in';
          } else {
            info.innerHTML = 'Logged in';    
            var params = {  identityId: response.data.identityId,
                                Logins: {
                            'cognito-identity.amazonaws.com': response.data.token
                                }
            };
            AWS.config.credentials = new AWS.CognitoIdentityCredentials({
                IdentityPoolId: 'us-east-1:56af2b09-f6cd-4254-b15f-128537f117e1', params
            });
            
            var creds = AWS.config.credentials;
            creds.params.IdentityId = response.data.identityId;
              creds.params.Logins = {
               'cognito-identity.amazonaws.com': response.data.token
            };
            creds.expired = true;
            console.log("Cognito Identity Id:", id);
            bucket = new AWS.S3({params: {Bucket: AWS_BucketName}});
            listObjects(AWS_Prefix);
            $.unblockUI();
          }
    }});
    }
  });
  
$(document).ready(function() { 
        $.blockUI({ message: $('#loginbox') }); 
  //      setTimeout($.unblockUI, 2000); 
         }); 
</script>
