import {argv, exit} from "node:process"
import {resolve} from "node:path"
import fs from "node:fs"

let filepath = resolve(argv[2]);

let contents = fs.readFileSync(filepath, {encoding:'utf-8'});

let tokens = [];
let validJSON = false;
//Lexer
let braces_stk = [];
for(let character of contents){
	if(character === '{'){
		tokens.push("OPEN_BRACE");
		braces_stk.push('{');
	}else if(character === '}'){
		tokens.push("CLOSED_BRACE");
		braces_stk.pop()	
	}	
}
if(braces_stk.length === 0){
	validJSON = true;
}else{
	console.log('Invalid JSON');
}

validJSON = false;
//Parser
for(let i = 0; i < tokens.length; i++){
	if(tokens[0] === "OPEN_BRACE"){
		validJSON = true;	
	}	
}

if(validJSON){
	console.log('Valid JSON');
	exit(0);
}else{
	console.log('Invalid JSON');
	exit(1);
}
