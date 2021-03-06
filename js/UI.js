var UIbindings;
$(document).ready(function() {

    d3.select("#canvas").on("click", function() {
        //newAnt = THREE.Vector2(d3.mouse(this)[0], d3.mouse(this)[1]);
        var canvasSizeHeight = parseFloat(d3.select(this).attr("height"));

        antUniforms.newAnt.value.x = d3.mouse(this)[0];
        antUniforms.newAnt.value.y = (canvasSizeHeight/ (window.devicePixelRatio)) - d3.mouse(this)[1];

        if(play == false) {
            UIStartRendering();
        }
    });

});

var startUI = function() {
    var menu = d3.select(".menu");

    var controls = d3.select(".controls");

    controls.append("button")
        .classed("toggle-rendering-button", true)
        .classed("icon-play", true)
        .on("click", function() {
            if(play == false) {
                UIStartRendering();
            } else {
                UIStopRendering();
            }
        });


    controls.append("button")
        .classed("print-parameters", true)
        .classed("icon-clipboard", true)
        .on("click", function() {
            var message = "{\n";
            d3.keys(parameters).forEach(function(key) {
                message += "\"" + key + "\" :" + parameters[key] + ",\n";
            });
            message += "}";

            alert(message);
        });

    controls.append("button")
        .classed("save-picture", true)
        .classed("icon-disk", true)
        .on("click", function() {
            var dataUrl = renderer.domElement.toDataURL("image/png");
            window.open(dataUrl, '_blank');
        });


    controls.append("button")
        .classed("toggle-living-painting", true)
        .classed("icon-pictures3", true)
        .on("click", function() {
            if(renderingView == RenderingView.LIVING) {
                renderingView = RenderingView.PAINTING;
            } else {
                renderingView = RenderingView.LIVING;
            }

            if(play == false) {
                UIStartRendering();
            }
        });

    controls.append("button")
        .classed("close-menu", true)
        .classed("icon-cogs", true)
        .on("click", function() {
            $(".menu").fadeToggle();
        });


    controls.append("button")
        .classed("icon-upload", true)
        .classed("input-file-button", true)
        .append("input")
        .attr("type", "file")
        .attr("id", "file-name")
        .on("change", function() {
            var f = document.getElementById("file-name");
            //console.log(document.getElementById("file-name").files);
            if (f.files && f.files[0]) {
                var reader = new FileReader();

                var image = document.createElement( 'img' );
                var texture = new THREE.Texture( image );
                reader.onload = function (e) {
                    image.src = e.target.result;
                    var texture = new THREE.Texture( image );
                    /*
                     $('#preview')
                     .attr('src', e.target.result)
                     .width(150)
                     .height(200);*/
                    texture.needsUpdate = true;
                    initLiving = texture;
                    antUniforms.livingTexture.value = initLiving;
                    livingUniforms.livingTexture.value = initLiving;
                    skipLoadImage = true;
                };

                reader.readAsDataURL(f.files[0]);

                if(play == false) {
                    renderingView = RenderingView.LIVING;
                    UIStartRendering();
                }
            }
        });

    d3.json("data/presets.json", function(json) {
        var presets = d3.select(".presets");

        var presentEl = presets.selectAll(".preset").data(json);

        presentEl.enter()
            .append("button")
            .classed("drawing-preset", true)
            .html(function(d) {
                return d["name"];
            })
            .on("click", function(d) {
                for(var key in d) {
                    if(key != "name") {
                        parameters[key] = d[key];
                    }
                }

                updateUIParam();
                UIStopRendering();
                UIStartRendering();
            });
    });



    var parametersBox = d3.select("ul.parameters");

    var paramArray = d3.keys(parameters);



    // Update
    var parametersControls = parametersBox.selectAll(".parameter").data(paramArray);

    // Enter
    var newControls =parametersControls.enter()
        .append("li")
        .classed("parameter", true);

    newControls.append("label")
        .attr("for", function (d) {return d;})
        .html(function(d) {return d});

    newControls.append("input")
        .attr("type", "text")
        .attr("id", function (d) {return d;})
        .attr("name", function (d) {return d;})
        .attr("value", function(d) {return parameters[d]})
        .on("keyup", function() {
            if(d3.event.keyCode == 13) {
                UIStartRendering();
            }
        })
        .on("input", function(d) {

            if(d3.event.keyCode != 13) {
                UIStopRendering();
                parameters[d] = +this.value;
                console.log("changed");
            }
        })
        .on("focusin", function() {
            UIStopRendering();
        });
};

var updateUIParam = function() {
    var paramArray = d3.keys(parameters);
    var parametersControls = d3.selectAll(".parameter").data(paramArray);

    for(var key in parameters) {
        d3.select("#" + key).attr("value", parameters[key]);
    }
};



var UIStartRendering = function() {
    init();

    var button = d3.select(".toggle-rendering-button");
    button.classed("icon-stop", true);
    button.classed("icon-play", false);
    if(play == false) {
        play = true;
        requestAnimationFrame( animate );
    }
};

var UIStopRendering = function() {
    play = false;
    var button = d3.select(".toggle-rendering-button");
    button.classed("icon-stop", false);
    button.classed("icon-play", true);
};
