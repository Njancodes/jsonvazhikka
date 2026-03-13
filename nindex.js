import {argv, exit} from "node:process"
import {resolve} from "node:path"
import fs from "node:fs"

let filepath = resolve(argv[2]);

let contents = fs.readFileSync(filepath, {encoding:'utf-8'});

let isReadString = false; 
let strValue = '';
let foundEscChr = false;
let escChrs = ['"', '\\', '/', 'b', 'f', 'n', 'r', 't']
for(let i = 0; i < contents.length; i++){
	if(foundEscChr){		
		strValue += contents[i];	
		foundEscChr = false;
		continue;
	}
	if(contents[i] === '"'){
		isReadString = !isReadString;	
		continue;
	}
	if(isReadString){	
		if(contents[i] === '\\'){
			if(escChrs.includes(contents[i+1])){
				foundEscChr = true;
			}else if(contents[i+1] === 'u'){
				let hexdecimalRegex = /[a-fA-F0-9]/;
				strValue+='\\u'
				//Four hex digits
				for(let j = 2; j < 6;j++){
					if(!hexdecimalRegex.test(contents[i+j])){
						console.log("Error not valid hexadecimal digit");
						break;	
					}	
					strValue += contents[i+j];
				}
				i += 5;
				continue;
			}else{
				console.log('Error where is the escape character ?');
				break;
			}
		}else if(contents[i] === '"'){
			console.log('Not the correct placement of double quotes, use \\" to escape the " character')
		}
		strValue += contents[i];	
	}else{
		if(/[a-zA-Z]/.test(contents[i])){
			console.log('Invalid Keyword')
			break;
		}
	}
}
console.log(strValue);
