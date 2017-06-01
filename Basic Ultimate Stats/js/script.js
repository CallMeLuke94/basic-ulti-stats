$(function() {
    var firstHalf = true;
    var team1Offense = true;
    var team1HasDisc = true;
    var team1ScoredLast = [];
    var team1Turns = 0;
    var team2Turns = 0;
    var team1Goals = 0;
    var team2Goals = 0;
    var tableData = ["<table id='data' class='table table-bordered table-condensed'><tr><th>Turns</th><th>O/D</th><th>Score</th><th>O/D</th><th>Turns</th></tr></table>"];
    var inputs = [];
    var scoretable = [];

    function ScoreEntry(_Team1Turns, _Team1Side, _Team1Score, _Team2Turns, _Team2Side, _Team2Score) {
        this.Team1Turns = _Team1Turns;
        this.Team1Side = _Team1Side;
        this.Team1Score = _Team1Score;
        this.Team2Turns = _Team2Turns;
        this.Team2Side = _Team2Side;
        this.Team2Score = _Team2Score;
    }

    function Results() {
        this.PointsPlayed = [0, 0];
        this.GoalsScored = [0, 0];
        this.Turnovers = [0, 0];
        this.Blocks = [0, 0];
        this.Breaks = [0, 0];
        this.NoTurnGoals = [0, 0];
        this.GoalsWithTurns = [0, 0];
        this.HadDiscPoints = [0, 0];
        this.ConversionRate = [0, 0];
        this.PerfectConversionRate = [0, 0];
        this.MeanTurnsPerPoint = [0, 0];
        this.RecoveryRate = [0, 0];
        this.DefensiveSuccessRate = 0;
    }

    var team1Results = new Results();
    var team2Results = new Results();

    $("#team1name").blur(function() {
        $(".team1").html($("#team1name").html());
    });

    $("#team2name").blur(function() {
        $(".team2").html($("#team2name").html());
    });

    $("#turnover").click(function() {
        team1HasDisc ? (team1Turns += 1) : (team2Turns += 1);
        $("#turnover").html(team1Turns + " Turnovers " + team2Turns);
        team1HasDisc = !team1HasDisc;

        inputs.push("turnover");
        $("#undo").attr("disabled", false);
    });

    $("#score").click(function() {
        var team1Side;
        var team2Side;
        var team1Class = "";
        var team2Class = "";

        if (team1Offense) {
            team1Side = "O";
            team1Results.PointsPlayed[0] += 1;
            team1Results.Turnovers[0] += team1Turns;

            team2Side = "D";
            team2Results.Turnovers[1] += team2Turns;

            if (team1Turns > 0) {
                team2Results.HadDiscPoints[1] += 1;
            }
        } else {
            team1Side = "D";
            team1Results.PointsPlayed[1] += 1;
            team1Results.Turnovers[1] += team1Turns;

            team2Side = "O";
            team2Results.Turnovers[0] += team2Turns;

            if (team2Turns > 0) {
                team1Results.HadDiscPoints[1] += 1;
            }
        }

        if (team1HasDisc) {
            if (team1Offense) {
                team1Class = "hold";
                team1Results.GoalsScored[0] += 1;
                if (team1Turns === 0) {
                    team1Class += " perfect";
                    team1Results.NoTurnGoals[0] += 1;
                }
            } else {
                team1Class = "break";
                team1Results.GoalsScored[1] += 1;
                if (team1Turns === 0) {
                    team1Class += " perfect";
                    team1Results.NoTurnGoals[1] += 1;
                }
            }

            team2Class = team1Offense ? "conceded" : "broken";

            team1Goals += 1;
            team1Offense = false;
            $("#team1score").html(team1Goals);
            $("#team1mode").html("Defense");
            $("#team2mode").html("Offense");
            team1ScoredLast.push(true);
        } else {
            if (team1Offense) {
                team2Class = "break";
                team2Results.GoalsScored[1] += 1;
                if (team2Turns === 0) {
                    team2Class += " perfect";
                    team2Results.NoTurnGoals[1] += 1;
                }
            } else {
                team2Class = "hold";
                team2Results.GoalsScored[0] += 1;
                if (team2Turns === 0) {
                    team2Class += " perfect";
                    team2Results.NoTurnGoals[0] += 1;
                }
            }

            team1Class = team1Offense ? "broken" : "conceded";

            team2Goals += 1;
            team1Offense = true;
            $("#team2score").html(team2Goals);
            $("#team1mode").html("Offense");
            $("#team2mode").html("Defense");
            team1ScoredLast.push(false);
        }

        var entry = new ScoreEntry(team1Turns, team1Side, team1Goals, team2Turns, team2Goals, team2Goals);
        scoretable.push(entry);

        var newRow = "<tr><td class='" + team1Class + "'>" + entry.Team1Turns + "</td><td class='" + team1Class + "'>" + entry.Team1Side + "</td><td>" + entry.Team1Score + "-" + entry.Team2Score + "</td><td class='" + team2Class + "'>" + entry.Team2Side + "</td><td class='" + team2Class + "'>" + entry.Team2Turns + "</td></tr>";
        tableData.push(newRow);
        $("#data").html(tableData.join(""));

        team1HasDisc = !team1HasDisc;
        resetTurnovers();

        if (firstHalf) {
            $("#halftime").attr("disabled", false);
        }

        updateTable();
        inputs.push("score");
        $("#undo").attr("disabled", false);
    });

    $("#halftime").click(function() {
        firstHalf = false;
        team1Offense = false;
        team1HasDisc = false;

        $("#team1mode").html("Defense");
        $("#team2mode").html("Offense");

        tableData.push("<tr><td colspan='5' class='half'>HALF</td></tr>");
        $("#data").html(tableData.join(""));

        $("#halftime").attr("disabled", true);

        inputs.push("half");
        $("#undo").attr("disabled", false);
    });

    $("#undo").click(function() {
        switch (inputs[inputs.length - 1]) {
            case "turnover":
                undoTurnover();
                break;
            case "score":
                undoScore();
                break;
            case "half":
                undoHalf();
                break;
        }

        inputs.pop();
        if (inputs.length === 0) {
            $("#undo").attr("disabled", true);
        }
    });

    function resetTurnovers() {
        team1Turns = 0;
        team2Turns = 0;
        $("#turnover").html("Turnover");
    }

    function undoTurnover() {
        team1HasDisc ? (team2Turns -= 1) : (team1Turns -= 1);
        team1HasDisc = !team1HasDisc;
        $("#turnover").html(team1Turns + " Turnovers " + team2Turns);
    }

    function undoScore() {
        team1HasDisc = !team1HasDisc;

        team1ScoredLast[team1ScoredLast.length - 1] ? (team1Goals -= 1) : (team2Goals -= 1);
        $("#team1score").html(team1Goals);
        $("#team2score").html(team2Goals);

        if (scoretable.length > 2) {
            var team1mode = (scoretable[scoretable.length - 2].Team1Side == "O") ? "Offense" : "Defense";
            var team2mode = (scoretable[scoretable.length - 2].Team2Side == "O") ? "Offense" : "Defense";
            $("#team1mode").html(team1mode);
            $("#team2mode").html(team2mode);
            team1Offense = team1ScoredLast[team1ScoredLast.length - 1];
        } else {
            $("#team1mode").html("Offense");
            $("#team2mode").html("Defense");
            team1Offense = true;
        }

        team1Turns = scoretable[scoretable.length - 1].Team1Turns;
        team2Turns = scoretable[scoretable.length - 1].Team2Turns;
        $("#turnover").html(team1Turns + " Turnovers " + team2Turns);

        team1ScoredLast.pop();
        scoretable.pop();
        tableData.pop();
        $("#data").html(tableData.join(""));
        if (tableData.length == 1) {
            $("#halftime").attr("disabled", true);
        }
    }

    function undoHalf() {
        firsthalf = true;

        if (team1ScoredLast) {
            team1Offense = false;
            team1HasDisc = false;
            $("#team1mode").html("Defense");
            $("#team2mode").html("Offense");
        } else {
            team1Offense = true;
            team1HasDisc = true;
            $("#team1mode").html("Offense");
            $("#team2mode").html("Defense");
        }

        tableData.pop();
        $("#data").html(tableData.join(""));
        $("#halftime").attr("disabled", false);
    }

    function updateTable() {
        computeResults();

        $("#ppO1").html(team1Results.PointsPlayed[0]);
        $("#ppD1").html(team1Results.PointsPlayed[1]);
        $("#ppO2").html(team2Results.PointsPlayed[0]);
        $("#ppD2").html(team2Results.PointsPlayed[1]);

        $("#gsO1").html(team1Results.GoalsScored[0]);
        $("#gsD1").html(team1Results.GoalsScored[1]);
        $("#gsO2").html(team2Results.GoalsScored[0]);
        $("#gsD2").html(team2Results.GoalsScored[1]);

        $("#toO1").html(team1Results.Turnovers[0]);
        $("#toD1").html(team1Results.Turnovers[1]);
        $("#toO2").html(team2Results.Turnovers[0]);
        $("#toD2").html(team2Results.Turnovers[1]);

        $("#blO1").html(team1Results.Blocks[0]);
        $("#blD1").html(team1Results.Blocks[1]);
        $("#blO2").html(team2Results.Blocks[0]);
        $("#blD2").html(team2Results.Blocks[1]);

        $("#brO1").html(team1Results.Breaks[0]);
        $("#brD1").html(team1Results.Breaks[1]);
        $("#brO2").html(team2Results.Breaks[0]);
        $("#brD2").html(team2Results.Breaks[1]);

        $("#ntO1").html(team1Results.NoTurnGoals[0]);
        $("#ntD1").html(team1Results.NoTurnGoals[1]);
        $("#ntO2").html(team2Results.NoTurnGoals[0]);
        $("#ntD2").html(team2Results.NoTurnGoals[1]);

        $("#gtO1").html(team1Results.GoalsWithTurns[0]);
        $("#gtD1").html(team1Results.GoalsWithTurns[1]);
        $("#gtO2").html(team2Results.GoalsWithTurns[0]);
        $("#gtD2").html(team2Results.GoalsWithTurns[1]);

        $("#hdO1").html(team1Results.HadDiscPoints[0]);
        $("#hdD1").html(team1Results.HadDiscPoints[1]);
        $("#hdO2").html(team2Results.HadDiscPoints[0]);
        $("#hdD2").html(team2Results.HadDiscPoints[1]);

        $("#crO1").html(team1Results.ConversionRate[0] + "%");
        $("#crD1").html(team1Results.ConversionRate[1] + "%");
        $("#crO2").html(team2Results.ConversionRate[0] + "%");
        $("#crD2").html(team2Results.ConversionRate[1] + "%");

        $("#pcO1").html(team1Results.PerfectConversionRate[0] + "%");
        $("#pcD1").html(team1Results.PerfectConversionRate[1] + "%");
        $("#pcO2").html(team2Results.PerfectConversionRate[0] + "%");
        $("#pcD2").html(team2Results.PerfectConversionRate[1] + "%");

        $("#mtO1").html(team1Results.MeanTurnsPerPoint[0]);
        $("#mtD1").html(team1Results.MeanTurnsPerPoint[1]);
        $("#mtO2").html(team2Results.MeanTurnsPerPoint[0]);
        $("#mtD2").html(team2Results.MeanTurnsPerPoint[1]);

        $("#rrO1").html(team1Results.RecoveryRate[0] + "%");
        $("#rrD1").html(team1Results.RecoveryRate[1] + "%");
        $("#rrO2").html(team2Results.RecoveryRate[0] + "%");
        $("#rrD2").html(team2Results.RecoveryRate[1] + "%");

        $("#ds1").html(team1Results.DefensiveSuccessRate + "%");
        $("#ds2").html(team2Results.DefensiveSuccessRate + "%");
    }

    function computeResults() {
        team2Results.PointsPlayed[0] = team1Results.PointsPlayed[1];
        team2Results.PointsPlayed[1] = team1Results.PointsPlayed[0];

        team1Results.Blocks[0] = team2Results.Turnovers[1];
        team1Results.Blocks[1] = team2Results.Turnovers[0];
        team2Results.Blocks[0] = team1Results.Turnovers[1];
        team2Results.Blocks[1] = team1Results.Turnovers[0];

        team1Results.Breaks[0] = team1Results.GoalsScored[0] - team1Results.PointsPlayed[0];
        team1Results.Breaks[1] = team1Results.GoalsScored[1];
        team2Results.Breaks[0] = -1 * team1Results.Breaks[1];
        team2Results.Breaks[1] = -1 * team1Results.Breaks[0];

        team1Results.GoalsWithTurns[0] = team1Results.GoalsScored[0] - team1Results.NoTurnGoals[0];
        team1Results.GoalsWithTurns[1] = team1Results.GoalsScored[1] - team1Results.NoTurnGoals[1];
        team2Results.GoalsWithTurns[0] = team2Results.GoalsScored[0] - team2Results.NoTurnGoals[0];
        team2Results.GoalsWithTurns[1] = team2Results.GoalsScored[1] - team2Results.NoTurnGoals[1];

        team1Results.HadDiscPoints[0] = team1Results.PointsPlayed[0];
        team2Results.HadDiscPoints[0] = team2Results.PointsPlayed[0];

        if (team1Results.HadDiscPoints[0] > 0) {
            team1Results.ConversionRate[0] = Math.round(100 * team1Results.GoalsScored[0] / team1Results.HadDiscPoints[0]);
        }
        if (team1Results.HadDiscPoints[1] > 0) {
            team1Results.ConversionRate[1] = Math.round(100 * team1Results.GoalsScored[1] / team1Results.HadDiscPoints[1]);
        }
        if (team2Results.HadDiscPoints[0] > 0) {
            team2Results.ConversionRate[0] = Math.round(100 * team2Results.GoalsScored[0] / team2Results.HadDiscPoints[0]);
        }
        if (team2Results.HadDiscPoints[1] > 0) {
            team2Results.ConversionRate[1] = Math.round(100 * team2Results.GoalsScored[1] / team2Results.HadDiscPoints[1]);
        }

        if (team1Results.HadDiscPoints[0] > 0) {
            team1Results.PerfectConversionRate[0] = Math.round(100 * team1Results.NoTurnGoals[0] / team1Results.HadDiscPoints[0]);
        }
        if (team1Results.HadDiscPoints[1] > 0) {
            team1Results.PerfectConversionRate[1] = Math.round(100 * team1Results.NoTurnGoals[1] / team1Results.HadDiscPoints[1]);
        }
        if (team2Results.HadDiscPoints[0] > 0) {
            team2Results.PerfectConversionRate[0] = Math.round(100 * team2Results.NoTurnGoals[0] / team2Results.HadDiscPoints[0]);
        }
        if (team2Results.HadDiscPoints[1] > 0) {
            team2Results.PerfectConversionRate[1] = Math.round(100 * team2Results.NoTurnGoals[1] / team2Results.HadDiscPoints[1]);
        }

        if (team1Results.HadDiscPoints[0] > 0) {
            team1Results.MeanTurnsPerPoint[0] = Math.round(100 * team1Results.Turnovers[0] / team1Results.HadDiscPoints[0]) / 100;
        }
        if (team1Results.HadDiscPoints[1] > 0) {
            team1Results.MeanTurnsPerPoint[1] = Math.round(100 * team1Results.Turnovers[1] / team1Results.HadDiscPoints[1]) / 100;
        }
        if (team2Results.HadDiscPoints[0] > 0) {
            team2Results.MeanTurnsPerPoint[0] = Math.round(100 * team2Results.Turnovers[0] / team2Results.HadDiscPoints[0]) / 100;
        }
        if (team2Results.HadDiscPoints[1] > 0) {
            team2Results.MeanTurnsPerPoint[1] = Math.round(100 * team2Results.Turnovers[1] / team2Results.HadDiscPoints[1]) / 100;
        }

        if (team1Results.GoalsWithTurns[0] - team1Results.Breaks[0] > 0) {
            team1Results.RecoveryRate[0] = Math.round(100 * team1Results.GoalsWithTurns[0] / (team1Results.GoalsWithTurns[0] - team1Results.Breaks[0]));
        }
        if (team1Results.PointsPlayed[1] - team1Results.NoTurnGoals[1] > 0) {
            team1Results.RecoveryRate[1] = Math.round(100 * team1Results.GoalsWithTurns[1] / (team1Results.PointsPlayed[1] - team1Results.NoTurnGoals[1]));
        }
        if (team2Results.GoalsWithTurns[0] - team2Results.Breaks[0] > 0) {
            team2Results.RecoveryRate[0] = Math.round(100 * team2Results.GoalsWithTurns[0] / (team2Results.GoalsWithTurns[0] - team2Results.Breaks[0]));
        }
        if (team2Results.PointsPlayed[1] - team2Results.NoTurnGoals[1] > 0) {
            team2Results.RecoveryRate[1] = Math.round(100 * team2Results.GoalsWithTurns[1] / (team2Results.PointsPlayed[1] - team2Results.NoTurnGoals[1]));
        }

        if (team1Results.PointsPlayed[1] > 0) {
            team1Results.DefensiveSuccessRate = Math.round(100 * team1Results.HadDiscPoints[1] / team1Results.PointsPlayed[1]);
        }
        if (team2Results.PointsPlayed[1] > 0) {
            team2Results.DefensiveSuccessRate = Math.round(100 * team2Results.HadDiscPoints[1] / team2Results.PointsPlayed[1]);
        }

    }
});
