function el(id) { return document.getElementById(id); }
let calc_eval = function (f, dryrun) { return false; }
let calc_errstart = function () { return 0; }
let calc_errend = function () { return 0; }
let calc_errmsg = function () { return ""; }
let calc_valuestr = function () { return ""; }
let calc_typestr = function () { return ""; }
let calc_numautocompletes = function () { return 0; }
let calc_autocomplete_name = function () { return ""; }
let calc_plot = function (x) { return 0.0; }
var Module = {
    onRuntimeInitialized: function () {
        calc_eval = Module.cwrap('calc_eval', 'boolean', ['string', 'boolean']);
        calc_errstart = Module.cwrap('calc_errstart', 'number', []);
        calc_errend = Module.cwrap('calc_errend', 'number', []);
        calc_errmsg = Module.cwrap('calc_errmsg', 'string', []);
        calc_valuestr = Module.cwrap('calc_valuestr', 'string', []);
        calc_typestr = Module.cwrap('calc_typestr', 'string', []);
        calc_numautocompletes = Module.cwrap('calc_numautocompletes', 'number', []);
        calc_autocomplete_name = Module.cwrap('calc_autocomplete_name', 'string', ['number']);
        calc_plot = Module.cwrap('calc_plot', 'number', ['number']);
        evaluate();
    },
};
function evaluate() {
    let input_str = el("input").value;
    let result_ok = calc_eval(input_str, true);
    let errbox = el("errbox");
    let resbox = el("resbox");
    let errhighlight = el("errhighlight");
    let ruler = el("ruler");
    ruler.innerHTML = input_str;
    errbox.style.display = 'none';
    errhighlight.style.display = 'none';
    resbox.style.display = 'none';
    if (input_str.length <= 0) {
        return;
    }
    if (result_ok) {
        resbox.innerHTML = `» ${calc_valuestr()}<span> ${calc_typestr()}</span>`;
        resbox.style.display = 'block';
        resbox.style.left = (ruler.offsetWidth + 30) + "px";
    } else {
        errbox.innerHTML = calc_errmsg();
        errbox.style.display = 'block';
        errbox.style.left = (ruler.offsetWidth + 33) + "px";

        ruler.innerHTML = input_str.substring(0, calc_errstart());
        errhighlight.style.display = 'block';
        errhighlight.style.left = (ruler.offsetWidth + 20) + "px";
        ruler.innerHTML = input_str.substring(calc_errstart(), calc_errend());
        errhighlight.style.width = ruler.offsetWidth + "px";
    }
    // let numautocompletes = calc_numautocompletes();
    // console.log(numautocompletes);
    // for (let i = 0; i < numautocompletes; i++) {
    //     console.log(calc_autocomplete_name(i));
    // }
};
function drawgraph(input_str, ctx, width, height, offsetx, offsety, scalex, scaley) {
    ctx.clearRect(0, 0, width, height);
    calc_eval(input_str, true);
    function to_screen_x(v) {
        return scalex * v * width + offsetx;
    }
    function to_screen_y(v) {
        return -scaley * v * height + offsety;
    }
    function to_plot_x(v) {
        return (v - offsetx) / (scalex * width);
    }
    function to_plot_y(v) {
        return (v - offsety) / (scaley * height);
    }
    // calculate line markings
    let px_width = to_screen_x(1.0) - to_screen_x(0.0);
    let dx = 1.0;
    while (px_width > width * 0.02) {
        dx *= 0.5;
        px_width *= 0.5;
    }
    while (px_width < width * 0.08) {
        dx *= 2.0;
        px_width *= 2.0;
    }
    let sx = Math.ceil(to_plot_x(0) / dx) * dx;
    let ex = Math.ceil(to_plot_x(width) / dx) * dx;
    let py_height = to_screen_y(0.0) - to_screen_y(1.0);
    let dy = 1.0;
    while (py_height > width * 0.02) {
        dy *= 0.5;
        py_height *= 0.5;
    }
    while (py_height < width * 0.08) {
        dy *= 2.0;
        py_height *= 2.0;
    }
    let sy = Math.ceil(to_plot_y(0) / dy) * dy;
    let ey = Math.ceil(to_plot_y(height) / dy) * dy;
    // draw lines
    {
        if (sx % (dx * 2.0) == 0.0) {
            sx -= dx;
        }
        if (sy % (dy * 2.0) == 0.0) {
            sy -= dy;
        }
        ctx.strokeStyle = "#71787F";
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let i = sx + dx; i < ex; i += dx * 2.0) {
            ctx.moveTo(to_screen_x(i), 0.0);
            ctx.lineTo(to_screen_x(i), height);
        }
        for (let i = sy + dy; i < ey; i += dy * 2.0) {
            ctx.moveTo(0.0, to_screen_y(-i));
            ctx.lineTo(width, to_screen_y(-i));
        }
        ctx.stroke();

        ctx.strokeStyle = "#2E3842";
        ctx.beginPath();
        for (let i = sx; i < ex; i += dx * 2.0) {
            ctx.moveTo(to_screen_x(i), 0.0);
            ctx.lineTo(to_screen_x(i), height);
        }
        for (let i = sy; i < ey; i += dy * 2.0) {
            ctx.moveTo(0.0, to_screen_y(-i));
            ctx.lineTo(width, to_screen_y(-i));
        }
        ctx.stroke();

        ctx.strokeStyle = "#C7D6E5";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(to_screen_x(0.0), 0);
        ctx.lineTo(to_screen_x(0.0), height);
        ctx.moveTo(0, to_screen_y(0.0));
        ctx.lineTo(width, to_screen_y(0.0));
        ctx.stroke();
    }
    // draw line legend
    {
        ctx.font = "12px vera";
        ctx.textBaseline = "top";
        ctx.textAlign = "left";
        ctx.fillStyle = "#C7D6E5";
        for (let i = sx; i < ex; i += dx) {
            ctx.fillText(i.toString(), to_screen_x(i) + 5, to_screen_y(0.0) + 5);
        }
        for (let i = sy; i < ey; i += dy) {
            ctx.fillText((-i).toString(), to_screen_x(0.0) + 5, to_screen_y(-i) + 5);
        }
    }
    // draw the function itself
    ctx.strokeStyle = "#e4a512";
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let px = 0; px < width; px++) {
        let x = to_plot_x(px);
        let y = calc_plot(x);
        if (px == 0) {
            ctx.moveTo(px, to_screen_y(y));
        } else {
            ctx.lineTo(px, to_screen_y(y));
        }
    }
    ctx.stroke();
}
let results_list = [];
let results_idx = -1;
window.onload = function () {
    let results = el("results");
    let input = el("input");
    input.oninput = evaluate;
    input.onkeydown = e => {
        switch (e.key) {
            case "Enter":
                let input_str = input.value;
                let result_ok = calc_eval(input_str, false);
                if (result_ok) {
                    el("welcome").style.display = 'none';
                    let ctx = null, graphel = null, resetbuttonel = null, width = 0, height = 0;
                    if (input_str.startsWith("plot(")) {
                        graphel = document.createElement("canvas");
                        height = Math.floor((window.innerHeight - 100) / 2);
                        graphel.height = height;
                        graphel.style.height = height + "px";
                        results.appendChild(graphel);
                        width = Math.floor(graphel.offsetWidth);
                        graphel.width = width;
                        ctx = graphel.getContext("2d");

                        resetbuttonel = document.createElement("button");
                        resetbuttonel.classList.add("resetgraph");
                        resetbuttonel.innerText = "Reset";
                        results.appendChild(resetbuttonel);
                    }
                    let newel = document.createElement("div");
                    newel.innerHTML = input_str + `<span class="resspan"> » ${calc_valuestr()}<span> ${calc_typestr()}</span></span>`;
                    results.appendChild(newel);
                    results.scrollTo(0, results.scrollHeight);
                    input.value = "";
                    resbox.style.display = 'none';
                    errbox.style.display = 'none';
                    results_list.push(input_str);
                    results_idx = -1;
                    if (ctx != null) {
                        let xoff = width / 2, yoff = height / 2, xscale = 0.1, yscale = 0.1;
                        if (width > height) {
                            yscale = xscale * width / height;
                        } else {
                            xscale = yscale * height / width;
                        }

                        let xdragstart = 0.0, ydragstart = 0.0, xoffstart = 0.0, yoffstart = 0.0, is_dragging = false;
                        resetbuttonel.onclick = () => {
                            xoff = width / 2, yoff = height / 2, xscale = 0.1, yscale = 0.1;
                            if (width > height) {
                                yscale = xscale * width / height;
                            } else {
                                xscale = yscale * height / width;
                            }
                            drawgraph(input_str, ctx, width, height, xoff, yoff, xscale, yscale);
                        };
                        graphel.ontouchstart = evt => {
                            if (evt.touches.length == 1) {
                                is_dragging = true;
                                xdragstart = evt.touches[0].clientX; ydragstart = evt.touches[0].clientY;
                                xoffstart = xoff; yoffstart = yoff;
                            } else {
                                is_dragging = false;
                            }
                        };
                        graphel.ontouchmove = evt => {
                            if (evt.touches.length == 1 && is_dragging) {
                                xoff = xoffstart + evt.touches[0].clientX - xdragstart;
                                yoff = yoffstart + evt.touches[0].clientX - ydragstart;
                                drawgraph(input_str, ctx, width, height, xoff, yoff, xscale, yscale);
                            }
                        };
                        graphel.ontouchcancel = () => { is_dragging = false; };
                        graphel.ontouchend = () => { is_dragging = false; };

                        graphel.onmousedown = evt => {
                            if (evt.buttons == 1) {
                                is_dragging = true;
                                xdragstart = evt.clientX; ydragstart = evt.clientY;
                                xoffstart = xoff; yoffstart = yoff;
                            }
                        };
                        graphel.onmousemove = evt => {
                            if (is_dragging) {
                                xoff = xoffstart + evt.clientX - xdragstart;
                                yoff = yoffstart + evt.clientY - ydragstart;
                                drawgraph(input_str, ctx, width, height, xoff, yoff, xscale, yscale);
                            }
                        };
                        graphel.onmouseup = () => { is_dragging = false; };
                        graphel.onmouseleave = () => { is_dragging = false; };
                        graphel.onwheel = evt => {
                            xscale += evt.deltaY * -0.001 * xscale;
                            yscale += evt.deltaY * -0.001 * yscale;
                            if (width > height) {
                                yscale = xscale * width / height;
                            } else {
                                xscale = yscale * height / width;
                            }
                            drawgraph(input_str, ctx, width, height, xoff, yoff, xscale, yscale);
                            evt.preventDefault();
                        };
                        drawgraph(input_str, ctx, width, height, xoff, yoff, xscale, yscale);
                    }
                }
                break;
            case "ArrowUp":
                if (results_idx == -1) {
                    results_idx = results_list.length - 1;
                }
                if (results_list.length > 0) {
                    input.value = results_list[results_idx];
                    evaluate();
                    if (results_idx > 0) {
                        results_idx--;
                    }
                }
                break;
            case "ArrowDown":
                if (results_idx < results_list.length - 1) {
                    results_idx++;
                    input.value = results_list[results_idx];
                    evaluate();
                } else {
                    input.value = "";
                    evaluate();
                }
                break;
        }
    };
    input.focus();
};
