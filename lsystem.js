function Position(x, y, direction){
    this.x = x
    this.y = y
    this.direction = direction
}

function LSystem(ctx, command, raw_rules, angle, degree)
{
    this.ctx = ctx;
    this.command = command;
    this.raw_rules = raw_rules;
    this.angle = angle;
    this.direction = 180;
    this.degree = degree;

    this.x = 0, this.y = 0;
    this.width = ctx.canvas.width;
    this.height = ctx.canvas.height;
    this.line_length = 100;
    this.parsed_rules = {};
    this.stack = new Array();

    var rules = raw_rules.split(",")
    for ( var i = 0; i < rules.length; i++ ){
	var rule = rules[i].split('=');
	var operator = rule[0];
	var operend = rule[1];
	this.parsed_rules[operator] = operend;
    }

    this.degToRad = function(angle) {
	return angle*(Math.PI/180)
    }

    this.expandPath = function(command, degree) {
	if (degree == 1){
	    return command;
	}
	else {
	    var expanded_path = new String();
	    for(var i = 0; i < command.length; i++){
		if(command[i] in this.parsed_rules) {
		    expanded_path += this.parsed_rules[command[i]];
		}
		else {
		    expanded_path += command[i];
		}
	    }
	    return this.expandPath(expanded_path, degree-1);
	}
    }

    this.expandedPath = this.expandPath(this.command, this.degree);

    this.calcSize = function(){
	var x_min = 0, y_min = 0, x_max = 0, y_max = 0;
	var tmp_x = 0, tmp_y = 0, tmp_direction = 180, tmp_stack=new Array();
	for( var i = 0; i < this.expandedPath.length; i++ ){
	    current = this.expandedPath.charAt(i);
	    switch(current) {
	    case 'F':
	    case 'G':
		tmp_x += Math.sin(this.degToRad(tmp_direction))*this.line_length;
		tmp_y += Math.cos(this.degToRad(tmp_direction))*this.line_length;
		if(tmp_x > x_max){
		    x_max = tmp_x;
		}
		if (tmp_x < x_min){
		    x_min = tmp_x;
		}
		if(tmp_y > y_max){
		    y_max = tmp_y;
		}
		if (tmp_y < y_min){
		    y_min = tmp_y;
		}
		break;
	    case '>':
		tmp_direction -= this.angle;
		break;
	    case '<':
		tmp_direction += this.angle;
		break;
	    case '[':
		tmp_stack.push(new Position(tmp_x, tmp_y, tmp_direction))
		break;
	    case ']':
		pos = tmp_stack.pop();
		tmp_x = pos.x;
		tmp_y = pos.y;
		tmp_direction = pos.direction;
		break;
	    default:
		break;
	    }
	}
	var x_ratio = this.width/(x_max-x_min)
	var y_ratio = this.height/(y_max-y_min)
	if( x_ratio > y_ratio ){
	    var ratio = y_ratio
	}
	else{
	    var ratio = x_ratio
	}
	this.line_length = this.line_length * ratio;
	this.x = (this.width/2 - (ratio*(x_min+x_max)/2));
	this.y = (this.height/2 - (ratio*(y_min+y_max)/2));
    }

    this.drawTree = function() {
	
	this.ctx.fillStyle="rgb(255,255,255)";
	this.ctx.fillRect(0, 0, this.width, this.height);
	this.ctx.strokeStyle="rgb(0,0,0)";
	this.ctx.strokeRect(0, 0, this.width, this.height);
	this.ctx.strokeStyle="rgb(40,130,114)";
	
	for( var i = 0; i < this.expandedPath.length; i++ ){
	    current = this.expandedPath.charAt(i);
	    switch(current) {
	    case 'F':
	    case 'G':
		this.ctx.beginPath();
		this.ctx.moveTo(this.x, this.y);
		this.x += Math.sin(this.degToRad(this.direction))*this.line_length;
		this.y += Math.cos(this.degToRad(this.direction))*this.line_length;
		this.ctx.lineTo(this.x, this.y);
		this.ctx.closePath();
		this.ctx.stroke();
		break;
	    case '>':
		this.direction -= this.angle;
		break;
	    case '<':
		this.direction += this.angle;
		break;
	    case '[':
		this.stack.push(new Position(this.x, this.y, this.direction))
		break;
	    case ']':
		pos = this.stack.pop();
		this.x = pos.x;
		this.y = pos.y;
		this.direction = pos.direction;
		break;
	    case '(':
		/* Work In Progess */
		var prob = new String();
		i++;
		while(this.expandedPath.charAt(i) != ')'){
		    prob += this.expandedPath.charAt(i);
		    i++;
		}
		this.chance = parseDouble(prob);
		break;
	    default:
		break;
	    }
	}
    }
    this.init = function (){
	this.calcSize();
	this.drawTree();
    }
}

function initTree(){
    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");
    var in_command = document.getElementById("command").value
    var in_rules = document.getElementById("rules").value
    var in_angle = parseInt(document.getElementById('angle').value)
    var in_degree = parseInt(document.getElementById('degree').value)

    var tree = new LSystem(ctx, in_command, in_rules, in_angle, in_degree);
    tree.init();
}

function init() {
    document.getElementById("degree").onchange = initTree;
    document.getElementById("angle").onchange = initTree;
    document.getElementById("submit").onclick = initTree;

    document.getElementById("command").value ="F"
    document.getElementById("rules").value ="F=G[>F][<F]GF,G=GG"
    document.getElementById("angle").value = "45"
    document.getElementById("degree").value ="4"
    initTree()
}

window.onload = init
