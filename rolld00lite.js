// R00lite - Dice roller for the D00lite series of games
//   primarily focused on the Marx Bros variant of 
//   Covert Ops, as well as Rhombus - Epsilon Edition
const rolld00lite = (()=>{
	const version = '0.0.1';

const ch = (c) => {
    const entities = {
        '<' : 'lt',
        '>' : 'gt',
        "'" : '#39',
        '@' : '#64',
        '{' : '#123',
        '|' : '#124',
        '}' : '#125',
        '[' : '#91',
        ']' : '#93',
        '"' : 'quot',
        '*' : 'ast',
        '/' : 'sol',
        ' ' : 'nbsp'
    };
	if( entities.hasOwnProperty(c) ){
		return `&${entities[c]};`;
	}
	return '';
};

const checkInstall = () => {
	log('-=> R00lite v'+version+']');
};
const showHelp = (who) => {
	sendChat('','/w "'+who+'" '+
		'<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'+
		'<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 130%;">'+
		'R00lite v'+version+
		'</div>'+
		'<div style="padding-left:10px;margin-bottom:3px;">'+
		'<p>R00lite implements the rolling mechanics for D00lite systems.</p>'+
		'</div>'+
		'<b>Commands</b>'+
		'<div style="padding-left:10px;">'+
		'<b><span style="font-family: serif;">!r00 --init '+ch('')+ch('<')+'Init Value'+ch('>')+ch('|')+
			'--target '+ch('')+ch('<')+'attribute or skill'+ch('>')+ ' ' +ch('<')+'target value'+ch('>')+ch('|')+
			'--help'+ch(']')+'</span></b>'+
		'<div style="padding-left: 10px;padding-right:20px">'+
			'<p>Rolls a D00lite roll and displays the result.</p>'+
			'<ul>'+
				'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'+
					'<b><span style="font-family: serif;">--init '+ch('')+ch('<')+'Init Value'+ch('>')+'</span></b> '+ch('-')+
						' Rolls Init Value number of D10s and returns the highest.'+
				'</li> '+
				'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'+
					'<b><span style="font-family: serif;">--target '+ch('')+ch('<')+'attribute or skill'+ch('>')+ ' ' +ch('<')+'target value'+ch('>')+'</span></b> '+ch('-')+
						' Rolls D00 (value 0-99) and compares against target value.  Indicates success, failure, or crit.'+
				'</li> '+
				'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'+
					'<b><span style="font-family: serif;">--help</span></b> '+ch('-')+' Shows the Help screen'+
				'</li> '+
			'</ul>'+
		'</div>'+
    	'</div>'+
		'</div>'
    );
};

const handleInput = (msg) => {
	if (msg.type !== "api") {
		return;
	}

	let who=(getObj('player',msg.playerid)||{get:()=>'API'}).get('_displayname');

    log('Message content = ' +msg.content)

	let args = msg.content.split(/\s+/);
	/*
	options will be:
	    args[1] = --init and args[2] = init value
	    args[1] = --help
	    args[1] = --target, args[2] = ability/skill, args[3] = value
    */
	if (args[0]=="!r00") {
	    
	    // if we have only one arg, or if args contains --help, show help
		if( args.length < 2 || _.contains(args,'--help') ){
			showHelp(who);
			return;
		}
		if (args[1] == "--init") {
		    if (args.length < 2) {
		        sendChat("USAGE: !r00 --init <initiative score>")
		        return;
		    }
		    else
		    {
		        const rolls = [];
		        rolllist = "";
		        i = 0;
		        max_i = 0;
		        while (i < args[2]) {
		            rolls[i] = randomInteger(10);
		            if (rolls[i] > rolls[max_i]) {
		                max_i = i;
		            }
		            rolllist = rolllist + rolls[i];
		            i++;
		            if( i < args[2]) {
		                rolllist = rolllist + ", "
		            }
		        }
		        // Display rolls
		        /*
		        &{template:stargate} {{title=Title of the Roll}} {{subtitle=Subtitle which is optional }} {{color=}} {{Normal row= The sheet can have any number of these sections. Everything to the left of the equal sign is bolded.}} {{desc= If the left side contain exactly "desc", then the equal sign is removed and any content is spread to the with of the full template. Inline roll: [[d20+3]] }}
		        */
		        rolltext = "&{template:stargate} {{title=Initiative}} {{subtitle=" + who + " Rolls Initiative}} {{color=#4CAF50}} {{Initiative= " + rolls[max_i] + "}} {{desc= Rolls are " + rolllist + "}}"
		        //rolltext = "&{template:default} {{name= " + who + " Rolls Initiative}} {{Rolls are " + rolllist + "}} {{initiative is " + rolls[max_i] + "}}"
		        sendChat( `player|${msg.playerid}`, rolltext);
		        
		    }
		}
		else if (args[1] == "--target") {
		    // args[1] = --target, args[2] = ability/skill, args[3] = value
		    if (args.length < 3) {
		        sendChat("USAGE: !r00 --target <ability/skill> <target>" )
		        return;
		    }
		    else
		    {
		        ability = args[2]; // This is the skill or stat to be used
		        target = args[3]; // This is what we have to roll equal to or under
		        
		        // We are rolling the tens and ones digit separately so that in 
		        // the future, we can handle FrontierSpace style advantage
		        // and disadvantage.
		        did_i_crit = "";
		        leftshark = randomInteger(10)-1;  // tens digit
		        rightshark = randomInteger(10)-1;  // ones digit
		        if (leftshark == rightshark) {
		            critical = 1
		            did_i_crit = "{{desc=CRITICAL}}"
		        }
		        else {
		            critical = 0
		            did_i_crit = ""
		        }
		        result = (leftshark * 10) + rightshark;
		        
		        log(result);
		        if ((result <= target && result < 95) || result <= 5) {
					if (critical == 1) {
						color = "critsuccess"
					}
					else {
						color = "success"
					}
		            rolltext = "&{template:stargate} {{title=" + ability + "}} {{subtitle=" + who + " Rolls vs target of " + target + "}} {{color=" + color + "}} {{Success= " + result + "}}" + did_i_crit
		        }
		        else {
					if (critical == 1) {
						color = "critfail"
					}
					else {
						color = "fail"
					}
		            rolltext = "&{template:stargate} {{title=" + ability + "}} {{subtitle=" + who + " Rolls vs target of " + target + "}} {{color=" + color + "}} {{Failure= " + result + "}}" + did_i_crit
		        }
		        sendChat( `player|${msg.playerid}`, rolltext);
		        
		    }
		}
	}
};


const registerEventHandlers = () => {
	on('chat:message', handleInput);
};

on('ready', () => {
	checkInstall();
	registerEventHandlers();
});

return {
};

})();