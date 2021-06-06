
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function (exports) {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.35.0' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src\line.svelte generated by Svelte v3.35.0 */

    const file$1 = "src\\line.svelte";

    function create_fragment$1(ctx) {
    	let p;
    	let span0;
    	let t0;
    	let span1;
    	let t1;
    	let span2;
    	let span3;

    	const block = {
    		c: function create() {
    			p = element("p");
    			span0 = element("span");
    			t0 = text(/*username*/ ctx[0]);
    			span1 = element("span");
    			t1 = text(/*path*/ ctx[1]);
    			span2 = element("span");
    			span2.textContent = "$";
    			span3 = element("span");
    			attr_dev(span0, "class", "chameleon-m svelte-1imx4hu");
    			add_location(span0, file$1, 7, 1, 105);
    			attr_dev(span1, "class", "blue-m svelte-1imx4hu");
    			add_location(span1, file$1, 7, 44, 148);
    			attr_dev(span2, "class", "plum-l svelte-1imx4hu");
    			add_location(span2, file$1, 7, 78, 182);
    			attr_dev(span3, "class", "svelte-1imx4hu");
    			add_location(span3, file$1, 7, 107, 211);
    			attr_dev(p, "class", "svelte-1imx4hu");
    			add_location(p, file$1, 6, 0, 99);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, span0);
    			append_dev(span0, t0);
    			append_dev(p, span1);
    			append_dev(span1, t1);
    			append_dev(p, span2);
    			append_dev(p, span3);
    			span3.innerHTML = /*text*/ ctx[2];
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*username*/ 1) set_data_dev(t0, /*username*/ ctx[0]);
    			if (dirty & /*path*/ 2) set_data_dev(t1, /*path*/ ctx[1]);
    			if (dirty & /*text*/ 4) span3.innerHTML = /*text*/ ctx[2];		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Line", slots, []);
    	let { username = "" } = $$props;
    	let { path = "" } = $$props;
    	let { text = "" } = $$props;
    	const writable_props = ["username", "path", "text"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Line> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("username" in $$props) $$invalidate(0, username = $$props.username);
    		if ("path" in $$props) $$invalidate(1, path = $$props.path);
    		if ("text" in $$props) $$invalidate(2, text = $$props.text);
    	};

    	$$self.$capture_state = () => ({ username, path, text });

    	$$self.$inject_state = $$props => {
    		if ("username" in $$props) $$invalidate(0, username = $$props.username);
    		if ("path" in $$props) $$invalidate(1, path = $$props.path);
    		if ("text" in $$props) $$invalidate(2, text = $$props.text);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [username, path, text];
    }

    class Line extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { username: 0, path: 1, text: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Line",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get username() {
    		throw new Error("<Line>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set username(value) {
    		throw new Error("<Line>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get path() {
    		throw new Error("<Line>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set path(value) {
    		throw new Error("<Line>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get text() {
    		throw new Error("<Line>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set text(value) {
    		throw new Error("<Line>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\App.svelte generated by Svelte v3.35.0 */

    const { console: console_1 } = globals;
    const file = "src\\App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[13] = list[i];
    	return child_ctx;
    }

    // (123:2) {:else}
    function create_else_block(ctx) {
    	let line;
    	let current;
    	const line_spread_levels = [/*line*/ ctx[13]];
    	let line_props = {};

    	for (let i = 0; i < line_spread_levels.length; i += 1) {
    		line_props = assign(line_props, line_spread_levels[i]);
    	}

    	line = new Line({ props: line_props, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(line.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(line, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const line_changes = (dirty & /*lines*/ 2)
    			? get_spread_update(line_spread_levels, [get_spread_object(/*line*/ ctx[13])])
    			: {};

    			line.$set(line_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(line.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(line.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(line, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(123:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (121:2) {#if typeof line === "string"}
    function create_if_block(ctx) {
    	let p;
    	let raw_value = /*line*/ ctx[13] + "";

    	const block = {
    		c: function create() {
    			p = element("p");
    			add_location(p, file, 121, 3, 2359);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			p.innerHTML = raw_value;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*lines*/ 2 && raw_value !== (raw_value = /*line*/ ctx[13] + "")) p.innerHTML = raw_value;		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(121:2) {#if typeof line === \\\"string\\\"}",
    		ctx
    	});

    	return block;
    }

    // (120:1) {#each lines as line}
    function create_each_block(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (typeof /*line*/ ctx[13] === "string") return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(120:1) {#each lines as line}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let main;
    	let t0;
    	let div1;
    	let div0;
    	let span0;
    	let t1_value = /*system*/ ctx[0].username + "";
    	let t1;
    	let span1;
    	let t2_value = /*system*/ ctx[0].path + "";
    	let t2;
    	let span2;
    	let t4;
    	let input_1;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value = /*lines*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			main = element("main");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t0 = space();
    			div1 = element("div");
    			div0 = element("div");
    			span0 = element("span");
    			t1 = text(t1_value);
    			span1 = element("span");
    			t2 = text(t2_value);
    			span2 = element("span");
    			span2.textContent = "$";
    			t4 = space();
    			input_1 = element("input");
    			attr_dev(span0, "class", "chameleon-m svelte-1a6luut");
    			add_location(span0, file, 128, 3, 2474);
    			attr_dev(span1, "class", "blue-m svelte-1a6luut");
    			add_location(span1, file, 128, 53, 2524);
    			attr_dev(span2, "class", "plum-l svelte-1a6luut");
    			add_location(span2, file, 128, 94, 2565);
    			attr_dev(div0, "class", "prefix");
    			add_location(div0, file, 127, 2, 2450);
    			attr_dev(input_1, "id", "input");
    			attr_dev(input_1, "class", "svelte-1a6luut");
    			add_location(input_1, file, 132, 2, 2615);
    			attr_dev(div1, "class", "flex svelte-1a6luut");
    			add_location(div1, file, 126, 1, 2429);
    			attr_dev(main, "class", "svelte-1a6luut");
    			add_location(main, file, 118, 0, 2263);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(main, null);
    			}

    			append_dev(main, t0);
    			append_dev(main, div1);
    			append_dev(div1, div0);
    			append_dev(div0, span0);
    			append_dev(span0, t1);
    			append_dev(div0, span1);
    			append_dev(span1, t2);
    			append_dev(div0, span2);
    			append_dev(div1, t4);
    			append_dev(div1, input_1);
    			/*input_1_binding*/ ctx[7](input_1);
    			set_input_value(input_1, /*input*/ ctx[2]);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input_1, "input", /*input_1_input_handler*/ ctx[8]),
    					listen_dev(input_1, "keydown", /*handleInput*/ ctx[4], false, false, false),
    					listen_dev(main, "load", /*sendWelcomMessage*/ ctx[5](), false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*lines*/ 2) {
    				each_value = /*lines*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(main, t0);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if ((!current || dirty & /*system*/ 1) && t1_value !== (t1_value = /*system*/ ctx[0].username + "")) set_data_dev(t1, t1_value);
    			if ((!current || dirty & /*system*/ 1) && t2_value !== (t2_value = /*system*/ ctx[0].path + "")) set_data_dev(t2, t2_value);

    			if (dirty & /*input*/ 4 && input_1.value !== /*input*/ ctx[2]) {
    				set_input_value(input_1, /*input*/ ctx[2]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_each(each_blocks, detaching);
    			/*input_1_binding*/ ctx[7](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	let { system = null } = $$props;
    	let { commands = {} } = $$props;
    	let history_index = 0;
    	let history = [];
    	let lines = [];
    	let input = "";
    	let inputElement = null;

    	function println(data) {
    		if (data === "") {
    			$$invalidate(1, lines = []);
    		} else if (typeof data === "stirng") {
    			$$invalidate(1, lines = [...lines, data]);
    		} else {
    			$$invalidate(1, lines = [...lines, data]);
    		}
    	}

    	function handleInput(event) {
    		switch (event.key) {
    			case "Enter":
    				println({
    					username: system.username,
    					path: system.path,
    					text: input
    				});
    				handleCommand(input);
    				$$invalidate(2, input = "");
    				break;
    			case "Tab":
    				event.preventDefault();
    				if (input) {
    					const args = input.split(" ");
    					args[args.length - 1];
    				}
    				break;
    			case "ArrowUp":
    			case "ArrowDown":
    				if (event.key === "ArrowUp") {
    					if (history_index == history.length) {
    						history.push(input);
    					}

    					history_index--;
    				} else {
    					history_index++;
    				}
    				if (history_index < 0) {
    					history_index = 0;
    				}
    				if (history_index >= history.length) {
    					history_index = history.length - 1;
    				}
    				console.log(history);
    				$$invalidate(2, input = history[history_index]);
    				setTimeout(
    					() => {
    						inputElement.focus();
    						$$invalidate(3, inputElement.selectionStart = input.length, inputElement);
    					},
    					1
    				);
    				break;
    		}

    		if (event.key === "Enter") ; else if (event.key === "Tab") {
    			event.preventDefault();

    			if (input) {
    				const args = input.split(" ");
    				args[args.length - 1];
    			}
    		}
    	}

    	function handleCommand(text) {
    		if (!text) {
    			return;
    		}

    		history.push(text);
    		history_index = history.length;
    		const split = text.split(" ");
    		const label = split[0];
    		const args = split.slice(1);
    		const executor = commands[label];

    		if (executor !== undefined) {
    			executor.execute(println, system, args);
    		} else {
    			println(`command not found: ${label}`);
    		}

    		$$invalidate(0, system);
    	}

    	function sendWelcomMessage() {
    		println("WELCOME TO Onimen's PORTFOLIO");
    		println("Type \"help\" to list all command");
    		println("(C) 2021 Onimen ALL RIGHT RESERVED.");
    	}

    	document.body.addEventListener("click", event => {
    		if (event.target === document.body) {
    			document.querySelector("#input").focus();
    		}
    	});

    	const writable_props = ["system", "commands"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function input_1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			inputElement = $$value;
    			$$invalidate(3, inputElement);
    		});
    	}

    	function input_1_input_handler() {
    		input = this.value;
    		$$invalidate(2, input);
    	}

    	$$self.$$set = $$props => {
    		if ("system" in $$props) $$invalidate(0, system = $$props.system);
    		if ("commands" in $$props) $$invalidate(6, commands = $$props.commands);
    	};

    	$$self.$capture_state = () => ({
    		Line,
    		system,
    		commands,
    		history_index,
    		history,
    		lines,
    		input,
    		inputElement,
    		println,
    		handleInput,
    		handleCommand,
    		sendWelcomMessage
    	});

    	$$self.$inject_state = $$props => {
    		if ("system" in $$props) $$invalidate(0, system = $$props.system);
    		if ("commands" in $$props) $$invalidate(6, commands = $$props.commands);
    		if ("history_index" in $$props) history_index = $$props.history_index;
    		if ("history" in $$props) history = $$props.history;
    		if ("lines" in $$props) $$invalidate(1, lines = $$props.lines);
    		if ("input" in $$props) $$invalidate(2, input = $$props.input);
    		if ("inputElement" in $$props) $$invalidate(3, inputElement = $$props.inputElement);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		system,
    		lines,
    		input,
    		inputElement,
    		handleInput,
    		sendWelcomMessage,
    		commands,
    		input_1_binding,
    		input_1_input_handler
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { system: 0, commands: 6 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get system() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set system(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get commands() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set commands(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    class System {
    	username = "guest@ONIX-PC";
    	path = "/";
    	commands = {};
    	direcotries = ["/"];
    	files = {};

    	constructor() {
    		this.initializeFileTree();
    	}

    	get allFiles() {
    		return this.direcotries.concat(Object.keys(this.files));
    	}

    	resolvePath(path) {
    		//開始文字列が「./」、「/」、「../」のいずれでもない場合、「./」を付与する
    		if (!/^(\/|\.{1,2}\/).*$/.test(path)) {
    			path = `./${path}`;
    		}

    		const names = path.split("/");
    		const currents = this.path === "/" ? [""] : this.path.split("/");

    		if (names.length) {
    			if (names[0] === ".") {
    				names.splice(0, 1, ...currents);
    			} else {
    				if (names[0] === "..") {
    					while (names.length && names[0] === "..") {
    						names.shift();
    						currents.pop();
    					}
    					names.unshift(...currents);
    				}
    			}
    		}

    		path = names.join("/");
    		return path;
    	}

    	initializeFileTree() {
    		this.direcotries.push("/about/");
    		this.direcotries.push("/products/");
    		this.direcotries.push("/links/");
    		this.files["/about/about.txt"] = `onimen(山本遼太郎)といいます。2002年11月26日生まれです。
		主にJavaとJavascriptで開発をしています。
		他にも、Python, Go言語などもに時々使います。
		JavaではEclipse、JavascriptではVSCodeを利用しています。
		このポートフォリオはsvelteというフレームワークを使用していますが、
		Vue.jsでSPAを作ったりもします。
		これまでに製作した作品は /products からご覧ください。`;
    		this.files["/products/TheLowHP.txt"] = `TheLowはマインクラフトのサーバー上で遊べるRPGです。
		こちらの公式サイトを制作しました。他のスタッフと話し合いながらロゴも制作しました。`;
    		this.files["/products/HMage-Mod.txt"] = `マインクラフトの海外サーバー(us.shotbow.net)で
		より楽しく遊ぶためのマインクラフトMODです。自分ともう一人の開発者で共同開発しました。`;
    		this.files["/products/TheLowHP.link"] = "https://portal.eximradar.jp/thelow";
    		this.files["/products/HMage-Mod.link"] = "https://hmage123456.github.io/hmgemod/";
    		this.files["/links/github.link"] = "https://github.com/Oni-Men";
    	}
    }

    class CommandLS {
    	getLabel() {
    		return "ls";
    	}

    	getUsage() {
    		return "ls [dir]";
    	}

    	execute(println, system, args) {
    		const path = (() => {
    			if (args.length == 0) {
    				return system.path;
    			} else {
    				return system.resolvePath(args[0]);
    			}
    		})();

    		if (path !== "/" && !system.direcotries.find((p) => p === `${path}/`)) {
    			return false;
    		}

    		const files = system.allFiles
    			.filter((p) => p.startsWith(path))
    			.filter((p) => system.allFiles.includes(p))
    			.map((p) => p.slice(path.length))
    			.filter((p) => p.split("/").filter((s) => s).length === 1);

    		if (files.length) {
    			println(files.join(", "));
    			return true;
    		}
    		return false;
    	}
    }

    class CommandCD {
    	getLabel() {
    		return "cd";
    	}

    	getUsage() {
    		return "cd [dir]";
    	}

    	execute(println, system, args) {
    		const path = (() => {
    			if (args.length == 0) {
    				return system.path;
    			} else {
    				return system.resolvePath(args[0]);
    			}
    		})();

    		if (path === "/") {
    			system.path = path;
    		} else if (system.direcotries.find((p) => p === `${path}/`)) {
    			system.path = path;
    		} else {
    			println("No such file or directory");
    		}
    		return false;
    	}
    }

    class CommandCat {
    	getLabel() {
    		return "cat";
    	}

    	getUsage() {
    		return "cat [file]";
    	}

    	execute(println, system, args) {
    		const path = (() => {
    			if (args.length == 0) {
    				return system.path;
    			} else {
    				return system.resolvePath(args[0]);
    			}
    		})();

    		const file = system.files[path];
    		if (file) {
    			if (path.endsWith(".link")) {
    				println("use: open [file]");
    				return;
    			}

    			file.split("\n").forEach((line) => {
    				println(line);
    			});
    		} else {
    			println("No such file or directory");
    		}
    		return false;
    	}
    }

    class CommandOpen {
    	getLabel() {
    		return "open";
    	}

    	getUsage() {
    		return "open [file]";
    	}

    	execute(println, system, args) {
    		const path = (() => {
    			if (args.length == 0) {
    				return system.path;
    			} else {
    				return system.resolvePath(args[0]);
    			}
    		})();

    		const file = system.files[path];
    		if (file) {
    			if (path.endsWith(".txt")) {
    				println("use: cat [file]");
    				return;
    			}
    			window.open(file);
    		} else {
    			println("No such file or directory");
    		}
    		return false;
    	}
    }

    class CommandHelp {
    	getLabel() {
    		return "help";
    	}

    	getUsage() {
    		return "help";
    	}

    	execute(println) {
    		for (const command of Object.values(commands)) {
    			println(command.getUsage());
    		}
    	}
    }

    class CommandClear {
    	getLabel() {
    		return "clear";
    	}

    	getUsage() {
    		return "clear";
    	}

    	execute(println, system, args) {
    		println("\u007F");
    		return true;
    	}
    }

    const commands = {};

    function registerCommand(command) {
    	commands[command.getLabel()] = command;
    }

    registerCommand(new CommandLS());
    registerCommand(new CommandCD());
    registerCommand(new CommandCat());
    registerCommand(new CommandOpen());
    registerCommand(new CommandHelp());
    registerCommand(new CommandClear());

    const app = new App({
    	target: document.body,
    	props: {
    		system: new System(),
    		commands,
    	},
    });

    exports.commands = commands;
    exports.default = app;

    Object.defineProperty(exports, '__esModule', { value: true });

    return exports;

}({}));
//# sourceMappingURL=bundle.js.map
