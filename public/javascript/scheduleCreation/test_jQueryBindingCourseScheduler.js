function assert(condition, message) {
    if (!condition) {
        throw message || "Assertion failed";
    }
}
function test_breaksHardScoreByDay(){
	startTimes = [ new Time(8,45), new Time(8,45), new Time(8,45), new Time(8,45), new Time(8,45), new Time(8,45), new Time(8,45)  ]
	endTimes   = [ new Time(17,30), new Time(17,30), new Time(17,30), new Time(17,30), new Time(17,30), new Time(17,30), new Time(17,30)  ]
	maxBreakTimes = new Time(2,0)
	schedules = [ {
					"schedule": [ new CunyClass(	  dept         = "MATH", 
                                                  number       = "101", 
                                                  daysOfWeek   = ["MON", "TUE"],
                                                  section      = new Section( [ new Class_Time( new Time(8,45), 
                                                        										new Time(10,00), 
                                                        										"MON"
                                                    										  ),
                                                    							new Class_Time( new Time(8,45), 
                                                        										new Time(10,00),
                                                        										"TUE"
                                                    										  ) 
                                                   							   ], "99999",
                                                   							),
                                                  teacher      = "Joe Smith",
                                                  teacherScore = undefined
                                            ), ]
					"Truth Value" : false,
                  },
                  {
                  	"schedule": [ new CunyClass(	  dept         = "MATH", 
                                                  number       = "102", 
                                                  daysOfWeek   = ["MON", "TUE"],
                                                  section      = new Section( [ new Class_Time( new Time(8,44), 
                                                        										new Time(10,00), 
                                                        										"MON"
                                                    										  ),
                                                    							new Class_Time( new Time(8,44), 
                                                        										new Time(10,00),
                                                        										"TUE"
                                                    										  ) 
                                                   							   ], "12345",
                                                   							),
                                                  teacher      = "Joe Smith",
                                                  teacherScore = undefined
                                            ), ]
					"Truth Value" : true,
                  },
                  {
                  	"schedule": [ new CunyClass(	  dept         = "MATH", 
                                                  number       = "103", 
                                                  daysOfWeek   = ["MON", "TUE"],
                                                  section      = new Section( [ new Class_Time( new Time(8,45), 
                                                        										new Time(10,00), 
                                                        										"MON"
                                                    										  ),
                                                    							new Class_Time( new Time(8,45), 
                                                        										new Time(17,31),
                                                        										"TUE"
                                                    										  ) 
                                                   							   ], "98765",
                                                   							),
                                                  teacher      = "Joe Smith",
                                                  teacherScore = undefined
                                            ), ]
					"Truth Value" : true,
                  },
                  {
                  	"schedule": [ new CunyClass(	  dept         = "MATH", 
                                                  number       = "102", 
                                                  daysOfWeek   = ["MON", "TUE"],
                                                  section      = new Section( [ new Class_Time( new Time(8,44), 
                                                        										new Time(10,00), 
                                                        										"MON"
                                                    										  ),
                                                    							new Class_Time( new Time(8,44), 
                                                        										new Time(10,00),
                                                        										"TUE"
                                                    										  ) 
                                                   							   ], "12345",
                                                   							),
                                                  teacher      = "Joe Smith",
                                                  teacherScore = undefined
                                            ), ]
					"Truth Value" : true,
                  },
                ]
	for(var s in schedules){
		assert(breaksHardScoreByDay(schedules[s]["schedule"], startTimes, endTimes, maxBreakTimes) == schedules[s]["Truth Value"], "test_breaksHardScoreByDay broke for schedule" + s)
	}
}