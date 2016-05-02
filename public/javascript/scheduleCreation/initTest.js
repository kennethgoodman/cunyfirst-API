	t0 = new Time(8,00)
	t1 = new Time(9,15)
	t2 = new Time(10,30)
	t3 = new Time(10,45)
	t4 = new Time(12,00)
	t5 = new Time(12,15)
	t6 = new Time(13,30)
	t7 = new Time(13,45)
	t8 = new Time(15,00)
	classTimes = [
		 new Class_Time(t0,t1)  // 8 - 915
		,new Class_Time(t1,t2) // 915 - 1030
		,new Class_Time(t1,t4) // 915 - 12
		,new Class_Time(t3,t4) // 1045 - 12
		,new Class_Time(t5,t6) // 1215 - 130
		,new Class_Time(t7,t8) // 145 - 3
	]
	Math201Classes = [ 
		new CunyClass(dept="Math", number=201, daysOfWeek=["MON","WED"], section=new Section(new Class_Time(new Time(15,45),new Time(17,35)),35530)),
	   	new CunyClass(dept="Math", number=201, daysOfWeek=["MON","WED"], section=new Section(new Class_Time(new Time(18,30),new Time(20,20)),35531)),
	   	new CunyClass(dept="Math", number=201, daysOfWeek=["TUE","THUR"],section=new Section(new Class_Time(new Time(13,40),new Time(15,30)),35532)),							
	   	new CunyClass(dept="Math", number=201, daysOfWeek=["TUE","THUR"],section=new Section(new Class_Time(new Time(17,00),new Time(17,50)),35533))
	]

	Math231Classes = [
    	new CunyClass(dept="Math", number=231, daysOfWeek=["TUE","THUR"],section=new Section(new Class_Time(new Time(12,10),new Time(14,00)),35541)),
		new CunyClass(dept="Math", number=231, daysOfWeek=["MON","WED"], section=new Section(new Class_Time(new Time(10,05),new Time(11,55)),35542)),
		new CunyClass(dept="Math", number=231, daysOfWeek=["MON","WED"],section= new Section(new Class_Time(new Time(13,40),new Time(15,30)),35543)),
		new CunyClass(dept="Math", number=231, daysOfWeek=["TUE","THUR"],section=new Section(new Class_Time(new Time(11,00),new Time(12,50)),35544)),
		new CunyClass(dept="Math", number=231, daysOfWeek=["TUE","THUR"],section=new Section(new Class_Time(new Time(17,00),new Time(18,50)),35545)),
		new CunyClass(dept="Math", number=231, daysOfWeek=["MON","WED"],section= new Section(new Class_Time(new Time(20,30),new Time(22,20)),35546))
    ]

	MathElectives = [
    	new CunyClass(dept="Math", number=524, daysOfWeek=["MON","WED"],section=new Section(new Class_Time(new Time(17,00),new Time(18,15)),35563)),
		new CunyClass(dept="Math", number=518, daysOfWeek=["MON","WED"],section=new Section(new Class_Time(new Time(17,00),new Time(18,15)),35562)),
		new CunyClass(dept="Math", number=509, daysOfWeek=["TUE","THUR"],section=new Section(new Class_Time(new Time(17,00),new Time(18,15)),35561)),
		new CunyClass(dept="Math", number=505, daysOfWeek=["TUE","THUR"],section=new Section(new Class_Time(new Time(15,10),new Time(16,25)),35559)),
		new CunyClass(dept="Math", number=505, daysOfWeek=["TUE","THUR"],section=new Section(new Class_Time(new Time(20,00),new Time(21,15)),35560)),
		new CunyClass(dept="Math", number=333, daysOfWeek=["MON","WED"],section=new Section(new Class_Time(new Time(13,40),new Time(14,55)),35558))
    ]

	RandomENGLElectives = [ 
    	new CunyClass(dept="ENGL", number=151, daysOfWeek=["TUE","THUR"],section=new Section(new Class_Time(new Time(7,45),new Time(9,0)),34487)),
		new CunyClass(dept="ENGL", number=151, daysOfWeek=["TUE","THUR"],section=new Section(new Class_Time(new Time(15,30),new Time(16,45)),34488)),
		new CunyClass(dept="ENGL", number=151, daysOfWeek=["TUE","THUR"],section=new Section(new Class_Time(new Time(18,30),new Time(21,20)),34489)),
		new CunyClass(dept="ENGL", number=151, daysOfWeek=["TUE","THUR"],section=new Section(new Class_Time(new Time(12,15),new Time(13,30)),34490)),
		new CunyClass(dept="ENGL", number=151, daysOfWeek=["TUE","THUR"],section=new Section(new Class_Time(new Time(10,45),new Time(12,0)),34491)),
		new CunyClass(dept="ENGL", number=152, daysOfWeek=["MON","MON"],section=new Section(new Class_Time(new Time(9,10),new Time(12,0)),27781))
    ]

	AnthroCOREs = [ 
    	new CunyClass(dept="ANTHRO", number=101, daysOfWeek=["TUE","THUR"],section=new Section(new Class_Time(new Time(7,45),new Time(9,0)),42276)),
		new CunyClass(dept="ANTHRO", number=101, daysOfWeek=["TUE","THUR"],section=new Section(new Class_Time(new Time(7,45),new Time(9,0)),42280)),
		new CunyClass(dept="ANTHRO", number=102, daysOfWeek=["TUE","THUR"],section=new Section(new Class_Time(new Time(12,15),new Time(13,30)),42366)),
		new CunyClass(dept="ANTHRO", number=102, daysOfWeek=["MON","MON"],section=new Section(new Class_Time(new Time(13,40),new Time(14,55)),42384)),
		new CunyClass(dept="ANTHRO", number=104, daysOfWeek=["TUE","THUR"],section=new Section(new Class_Time(new Time(15,10),new Time(16,25)),42424)),
		new CunyClass(dept="ANTHRO", number=104, daysOfWeek=["MON","MON"],section=new Section(new Class_Time(new Time(17,00),new Time(18,15)),42838))
	]
	listOfClasses = [ Math201Classes, Math231Classes, MathElectives, RandomENGLElectives, AnthroCOREs ]
	//console.log(listOfClasses)

	b = balancer(listOfClasses, 4)
	console.log(b)
