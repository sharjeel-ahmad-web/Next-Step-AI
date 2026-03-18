<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        @page {
            margin: 0;
            size: a4 landscape;
        }
        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            margin: 0;
            padding: 0;
            background-color: #1a1a2e; /* Sleek dark background matching the app */
            color: #ffffff;
        }
        .container {
            width: 100%;
            height: 100%;
            position: relative;
            padding: 50px;
            box-sizing: border-box;
            border: 20px solid #2d3436; /* Dark frame */
        }
        .inner-border {
            border: 5px solid #0984e3; /* Brand blue accents */
            height: 100%;
            padding: 40px;
            position: relative;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 40px;
            font-weight: bold;
            color: #0984e3;
            letter-spacing: 2px;
        }
        .title {
            text-align: center;
            font-size: 50px;
            text-transform: uppercase;
            letter-spacing: 10px;
            margin: 20px 0;
            color: #f1c40f; /* Gold for "Certificate of Completion" */
            font-weight: 300;
        }
        .awarded-to {
            text-align: center;
            font-size: 20px;
            margin-top: 30px;
            color: #bdc3c7;
        }
        .name {
            text-align: center;
            font-size: 60px;
            font-weight: bold;
            margin: 10px 0;
            color: #ffffff;
            border-bottom: 2px solid #2d3436;
            display: inline-block;
            min-width: 60%;
        }
        .description {
            text-align: center;
            font-size: 18px;
            line-height: 1.6;
            margin: 20px auto;
            max-width: 80%;
            color: #bdc3c7;
        }
        .footer {
            position: absolute;
            bottom: 40px;
            left: 40px;
            right: 40px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
        }
        .signature-box {
            text-align: center;
            width: 200px;
        }
        .signature {
            border-bottom: 1px solid #bdc3c7;
            margin-bottom: 5px;
            font-family: 'Brush Script MT', cursive;
            font-size: 24px;
        }
        .label {
            font-size: 12px;
            color: #7f8c8d;
            text-transform: uppercase;
        }
        .code {
            position: absolute;
            bottom: 20px;
            right: 20px;
            font-family: monospace;
            font-size: 10px;
            color: #34495e;
        }
        .avatar-container {
            text-align: center;
            margin-bottom: 20px;
        }
        .avatar {
            width: 100px;
            height: 100px;
            border-radius: 50%;
            border: 3px solid #0984e3;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="inner-border">
            <div class="header">
                <div class="logo">NEXTSTEP AI</div>
            </div>

            <div class="title">Certificate of Completion</div>

            <div class="avatar-container">
                @if($user_avatar)
                    <img src="{{ $user_avatar }}" class="avatar">
                @else
                    <div style="width:100px; height:100px; border-radius:50%; background:#0984e3; display:inline-block; font-size:40px; padding-top:20px; box-sizing:border-box;">{{ substr($user_name, 0, 1) }}</div>
                @endif
            </div>

            <div class="awarded-to">This recognition is proudly presented to</div>
            <div style="text-align: center;">
                <div class="name">{{ $user_name }}</div>
            </div>

            <div class="description">
                For the successful completion of the <strong>{{ $target_role }}</strong> professional learning roadmap and demonstrating commitment to continuous professional growth in the field of technology.
            </div>

            <div style="text-align: center; margin-top: 30px; font-size: 18px; color: #bdc3c7;">
                Issued on {{ $issued_at }}
            </div>

            <div class="footer">
                <div style="float: left;" class="signature-box">
                    <div class="signature">NextStep AI Team</div>
                    <div class="label">Platform Director</div>
                </div>
                
                <div style="float: right;" class="signature-box">
                    <div class="signature">AI Career Advisor</div>
                    <div class="label">Technical Lead</div>
                </div>
            </div>

            <div class="code">VERIFICATION ID: {{ $certificate_code }}</div>
        </div>
    </div>
</body>
</html>
