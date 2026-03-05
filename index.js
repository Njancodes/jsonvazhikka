import {argv, exit} from "node:process"
import {resolve} from "node:path"
import fs from "node:fs"

let filepath = resolve(argv[2]);

let contents = fs.readFileSync(filepath, {encoding:'utf-8'});

let tokens = [];
let validJSON = false;
//Lexer
let braces_stk = [];
let quotes_stk = [];
let invalid_character = false;
let invalid_characters = ["'"];
let prop_part = "KEY";
let word_values = "";
let read_values =false;
let alphanumeric_regex = /^[a-z0-9]+$/;
let numeric_regex = /^[0-9]+$/;
for(let character of contents){
	if(character === '{'){
		tokens.push("OPEN_BRACE");
		read_values = false;
		prop_part = "KEY";
		braces_stk.push('{');
	}else if(character === '}'){
		if(word_values === 'true' || word_values === 'false' || word_values === 'null' || numeric_regex.test(word_values)){
			tokens.push("VALUE");
		}
		word_values = '';
		tokens.push("CLOSED_BRACE");
		braces_stk.pop()	
	}else if(character === '"'){
		if(quotes_stk.length > 0){ 
			quotes_stk.pop();	
			tokens.push(prop_part);
			read_values = false;
		}else{
			quotes_stk.push('"');
			read_values = true;
		}	
	}else if(character == ':'){
		prop_part = "VALUE";
		word_values = '';
		read_values = true;
	}else if(character == ','){
		prop_part = "KEY"
		if(word_values === 'true' || word_values === 'false' || word_values === 'null' || numeric_regex.test(word_values)){
			tokens.push("VALUE");
			read_values = false;
		}
		word_values = '';
		tokens.push("COMMA");	
	}else if(alphanumeric_regex.test(character) && read_values){
		word_values += character;
	}else if(character == '['){
		tokens.push("ARRAY_START");
		read_values = false;
	}else if(character == ']'){
		tokens.push("ARRAY_END");
	}else if(!read_values && invalid_characters.includes(character)){
		invalid_character = true;
		break;
	}
}
if((braces_stk.length !== 0 && quotes_stk.length !== 0) || invalid_character){
	console.log('Invalid JSON');
	exit(1);
}

validJSON = true;
//Parser
console.log(tokens);
for(let i = 0; i < tokens.length; i++){
	if(tokens[0] !== "OPEN_BRACE"){
		console.log('No open brace at the start');
		validJSON = false;
		break;
	}	
	if(tokens[i] === "KEY" && (tokens[i+1] !== "VALUE" && tokens[i+1] !== "OPEN_BRACE" && tokens[i+1] !== "ARRAY_START")){ 
		console.log('Something wrong with the placement of key');
		validJSON = false;
		break;
	}
	if(tokens[i] === "VALUE" && (tokens[i+1] !== "COMMA" && tokens[i + 1] !== "CLOSED_BRACE" && tokens[i+1] !== "ARRAY_END")){
		console.log('Something wrong with the placement of value');
		validJSON = false;
		break;
	}

	if(tokens[i] === "COMMA" && tokens[i+1] !== "KEY"){
		console.log('A key should always come after the comma');
		validJSON = false;
		break;
	}
}

if(tokens.length === 0){
	validJSON = false;
}

if(validJSON){
	console.log('Valid JSON');
	exit(0);
}else{
	console.log('Invalid JSON');
	exit(1);
}
