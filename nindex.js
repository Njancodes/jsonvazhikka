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
		let code = checkString(contents[i],contents[i+1], i);
		if(code === 0){
			foundEscChr = true;
		}else if(code === 1){
			i += 5;
			continue;
		}else if(code === 2){
			console.log("Invalid Hex Digits");
			break;
		}else if(code === 3){
			console.log("Invalid Escape Character");
			break;
		}else if(code === 4){
			console.log("Incorrect '\"' Placement");
			break;
		}
	}else{
		if(/[a-zA-Z]/.test(contents[i])){
			console.log('Invalid Keyword');
			break;
		}
	}
}
console.log(strValue);

function checkString(chr, nextChr, slashUidx){ 
	if(chr === '\\'){
		if(escChrs.includes(nextChr)){
			//foundEscChr = true;
			return 0; //Skip Next Character
		}else if(nextChr === 'u'){
			let hexdecimalRegex = /[a-fA-F0-9]/;
			strValue+='\\u'
			//Four hex digits
			let invalidHex = false;
			for(let j = 2; j < 6;j++){
				if(!hexdecimalRegex.test(contents[slashUidx+j])){
					console.log("Error not valid hexadecimal digit");
					invalidHex = true;
				}	
				strValue += contents[slashUidx+j];
			}
			if(!invalidHex){  
				return 1 
			}else{ 
				return 2
			};
		}else{
			console.log('Error where is the escape character ?');
			return 3; //Invalid Escape Character
		}
	}else if(chr === '"'){
		console.log('Not the correct placement of double quotes, use \\" to escape the " character')
		return 4; //Incorrect '"' Placement
	}
	strValue += chr;	
}
