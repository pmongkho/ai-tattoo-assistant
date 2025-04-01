var Rb = Object.defineProperty,
	Nb = Object.defineProperties
var Ob = Object.getOwnPropertyDescriptors
var hs = Object.getOwnPropertySymbols,
	kb = Object.getPrototypeOf,
	Tg = Object.prototype.hasOwnProperty,
	Sg = Object.prototype.propertyIsEnumerable,
	xb = Reflect.get
var Cg = (e, t, n) =>
		t in e
			? Rb(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n })
			: (e[t] = n),
	y = (e, t) => {
		for (var n in (t ||= {})) Tg.call(t, n) && Cg(e, n, t[n])
		if (hs) for (var n of hs(t)) Sg.call(t, n) && Cg(e, n, t[n])
		return e
	},
	L = (e, t) => Nb(e, Ob(t))
var Ag = (e, t) => {
	var n = {}
	for (var r in e) Tg.call(e, r) && t.indexOf(r) < 0 && (n[r] = e[r])
	if (e != null && hs)
		for (var r of hs(e)) t.indexOf(r) < 0 && Sg.call(e, r) && (n[r] = e[r])
	return n
}
var Un = (e, t, n) => xb(kb(e), n, t)
var p = (e, t, n) =>
	new Promise((r, i) => {
		var o = (c) => {
				try {
					a(n.next(c))
				} catch (u) {
					i(u)
				}
			},
			s = (c) => {
				try {
					a(n.throw(c))
				} catch (u) {
					i(u)
				}
			},
			a = (c) => (c.done ? r(c.value) : Promise.resolve(c.value).then(o, s))
		a((n = n.apply(e, t)).next())
	})
function Rg(e, t) {
	return Object.is(e, t)
}
var ue = null,
	ps = !1,
	Ku = 1,
	Fe = Symbol('SIGNAL')
function U(e) {
	let t = ue
	return (ue = e), t
}
function Ng() {
	return ue
}
var $i = {
	version: 0,
	lastCleanEpoch: 0,
	dirty: !1,
	producerNode: void 0,
	producerLastReadVersion: void 0,
	producerIndexOfThis: void 0,
	nextProducerIndex: 0,
	liveConsumerNode: void 0,
	liveConsumerIndexOfThis: void 0,
	consumerAllowSignalWrites: !1,
	consumerIsAlwaysLive: !1,
	kind: 'unknown',
	producerMustRecompute: () => !1,
	producerRecomputeValue: () => {},
	consumerMarkedDirty: () => {},
	consumerOnSignalRead: () => {},
}
function ms(e) {
	if (ps) throw new Error('')
	if (ue === null) return
	ue.consumerOnSignalRead(e)
	let t = ue.nextProducerIndex++
	if (
		(Es(ue), t < ue.producerNode.length && ue.producerNode[t] !== e && Bi(ue))
	) {
		let n = ue.producerNode[t]
		ys(n, ue.producerIndexOfThis[t])
	}
	ue.producerNode[t] !== e &&
		((ue.producerNode[t] = e),
		(ue.producerIndexOfThis[t] = Bi(ue) ? Pg(e, ue, t) : 0)),
		(ue.producerLastReadVersion[t] = e.version)
}
function Pb() {
	Ku++
}
function Og(e) {
	if (!(Bi(e) && !e.dirty) && !(!e.dirty && e.lastCleanEpoch === Ku)) {
		if (!e.producerMustRecompute(e) && !Zu(e)) {
			Mg(e)
			return
		}
		e.producerRecomputeValue(e), Mg(e)
	}
}
function kg(e) {
	if (e.liveConsumerNode === void 0) return
	let t = ps
	ps = !0
	try {
		for (let n of e.liveConsumerNode) n.dirty || Fb(n)
	} finally {
		ps = t
	}
}
function xg() {
	return ue?.consumerAllowSignalWrites !== !1
}
function Fb(e) {
	;(e.dirty = !0), kg(e), e.consumerMarkedDirty?.(e)
}
function Mg(e) {
	;(e.dirty = !1), (e.lastCleanEpoch = Ku)
}
function vs(e) {
	return e && (e.nextProducerIndex = 0), U(e)
}
function Yu(e, t) {
	if (
		(U(t),
		!(
			!e ||
			e.producerNode === void 0 ||
			e.producerIndexOfThis === void 0 ||
			e.producerLastReadVersion === void 0
		))
	) {
		if (Bi(e))
			for (let n = e.nextProducerIndex; n < e.producerNode.length; n++)
				ys(e.producerNode[n], e.producerIndexOfThis[n])
		for (; e.producerNode.length > e.nextProducerIndex; )
			e.producerNode.pop(),
				e.producerLastReadVersion.pop(),
				e.producerIndexOfThis.pop()
	}
}
function Zu(e) {
	Es(e)
	for (let t = 0; t < e.producerNode.length; t++) {
		let n = e.producerNode[t],
			r = e.producerLastReadVersion[t]
		if (r !== n.version || (Og(n), r !== n.version)) return !0
	}
	return !1
}
function Qu(e) {
	if ((Es(e), Bi(e)))
		for (let t = 0; t < e.producerNode.length; t++)
			ys(e.producerNode[t], e.producerIndexOfThis[t])
	;(e.producerNode.length =
		e.producerLastReadVersion.length =
		e.producerIndexOfThis.length =
			0),
		e.liveConsumerNode &&
			(e.liveConsumerNode.length = e.liveConsumerIndexOfThis.length = 0)
}
function Pg(e, t, n) {
	if ((Fg(e), e.liveConsumerNode.length === 0 && Lg(e)))
		for (let r = 0; r < e.producerNode.length; r++)
			e.producerIndexOfThis[r] = Pg(e.producerNode[r], e, r)
	return e.liveConsumerIndexOfThis.push(n), e.liveConsumerNode.push(t) - 1
}
function ys(e, t) {
	if ((Fg(e), e.liveConsumerNode.length === 1 && Lg(e)))
		for (let r = 0; r < e.producerNode.length; r++)
			ys(e.producerNode[r], e.producerIndexOfThis[r])
	let n = e.liveConsumerNode.length - 1
	if (
		((e.liveConsumerNode[t] = e.liveConsumerNode[n]),
		(e.liveConsumerIndexOfThis[t] = e.liveConsumerIndexOfThis[n]),
		e.liveConsumerNode.length--,
		e.liveConsumerIndexOfThis.length--,
		t < e.liveConsumerNode.length)
	) {
		let r = e.liveConsumerIndexOfThis[t],
			i = e.liveConsumerNode[t]
		Es(i), (i.producerIndexOfThis[r] = t)
	}
}
function Bi(e) {
	return e.consumerIsAlwaysLive || (e?.liveConsumerNode?.length ?? 0) > 0
}
function Es(e) {
	;(e.producerNode ??= []),
		(e.producerIndexOfThis ??= []),
		(e.producerLastReadVersion ??= [])
}
function Fg(e) {
	;(e.liveConsumerNode ??= []), (e.liveConsumerIndexOfThis ??= [])
}
function Lg(e) {
	return e.producerNode !== void 0
}
function Vg(e) {
	let t = Object.create(Lb)
	t.computation = e
	let n = () => {
		if ((Og(t), ms(t), t.value === gs)) throw t.error
		return t.value
	}
	return (n[Fe] = t), n
}
var Gu = Symbol('UNSET'),
	qu = Symbol('COMPUTING'),
	gs = Symbol('ERRORED'),
	Lb = L(y({}, $i), {
		value: Gu,
		dirty: !0,
		error: null,
		equal: Rg,
		kind: 'computed',
		producerMustRecompute(e) {
			return e.value === Gu || e.value === qu
		},
		producerRecomputeValue(e) {
			if (e.value === qu) throw new Error('Detected cycle in computations.')
			let t = e.value
			e.value = qu
			let n = vs(e),
				r,
				i = !1
			try {
				;(r = e.computation()),
					U(null),
					(i = t !== Gu && t !== gs && r !== gs && e.equal(t, r))
			} catch (o) {
				;(r = gs), (e.error = o)
			} finally {
				Yu(e, n)
			}
			if (i) {
				e.value = t
				return
			}
			;(e.value = r), e.version++
		},
	})
function Vb() {
	throw new Error()
}
var jg = Vb
function Ug(e) {
	jg(e)
}
function Bg(e) {
	jg = e
}
var jb = null
function $g(e) {
	let t = Object.create(Ju)
	t.value = e
	let n = () => (ms(t), t.value)
	return (n[Fe] = t), n
}
function _s(e, t) {
	xg() || Ug(e), e.equal(e.value, t) || ((e.value = t), Ub(e))
}
function Hg(e, t) {
	xg() || Ug(e), _s(e, t(e.value))
}
var Ju = L(y({}, $i), { equal: Rg, value: void 0, kind: 'signal' })
function Ub(e) {
	e.version++, Pb(), kg(e), jb?.()
}
var Xu
function Hi() {
	return Xu
}
function jt(e) {
	let t = Xu
	return (Xu = e), t
}
var el = Symbol('NotFound')
function N(e) {
	return typeof e == 'function'
}
function wr(e) {
	let n = e((r) => {
		Error.call(r), (r.stack = new Error().stack)
	})
	return (
		(n.prototype = Object.create(Error.prototype)),
		(n.prototype.constructor = n),
		n
	)
}
var Is = wr(
	(e) =>
		function (n) {
			e(this),
				(this.message = n
					? `${n.length} errors occurred during unsubscription:
${n.map((r, i) => `${i + 1}) ${r.toString()}`).join(`
  `)}`
					: ''),
				(this.name = 'UnsubscriptionError'),
				(this.errors = n)
		}
)
function Bn(e, t) {
	if (e) {
		let n = e.indexOf(t)
		0 <= n && e.splice(n, 1)
	}
}
var X = class e {
	constructor(t) {
		;(this.initialTeardown = t),
			(this.closed = !1),
			(this._parentage = null),
			(this._finalizers = null)
	}
	unsubscribe() {
		let t
		if (!this.closed) {
			this.closed = !0
			let { _parentage: n } = this
			if (n)
				if (((this._parentage = null), Array.isArray(n)))
					for (let o of n) o.remove(this)
				else n.remove(this)
			let { initialTeardown: r } = this
			if (N(r))
				try {
					r()
				} catch (o) {
					t = o instanceof Is ? o.errors : [o]
				}
			let { _finalizers: i } = this
			if (i) {
				this._finalizers = null
				for (let o of i)
					try {
						zg(o)
					} catch (s) {
						;(t = t ?? []),
							s instanceof Is ? (t = [...t, ...s.errors]) : t.push(s)
					}
			}
			if (t) throw new Is(t)
		}
	}
	add(t) {
		var n
		if (t && t !== this)
			if (this.closed) zg(t)
			else {
				if (t instanceof e) {
					if (t.closed || t._hasParent(this)) return
					t._addParent(this)
				}
				;(this._finalizers =
					(n = this._finalizers) !== null && n !== void 0 ? n : []).push(t)
			}
	}
	_hasParent(t) {
		let { _parentage: n } = this
		return n === t || (Array.isArray(n) && n.includes(t))
	}
	_addParent(t) {
		let { _parentage: n } = this
		this._parentage = Array.isArray(n) ? (n.push(t), n) : n ? [n, t] : t
	}
	_removeParent(t) {
		let { _parentage: n } = this
		n === t ? (this._parentage = null) : Array.isArray(n) && Bn(n, t)
	}
	remove(t) {
		let { _finalizers: n } = this
		n && Bn(n, t), t instanceof e && t._removeParent(this)
	}
}
X.EMPTY = (() => {
	let e = new X()
	return (e.closed = !0), e
})()
var tl = X.EMPTY
function ws(e) {
	return (
		e instanceof X ||
		(e && 'closed' in e && N(e.remove) && N(e.add) && N(e.unsubscribe))
	)
}
function zg(e) {
	N(e) ? e() : e.unsubscribe()
}
var Je = {
	onUnhandledError: null,
	onStoppedNotification: null,
	Promise: void 0,
	useDeprecatedSynchronousErrorHandling: !1,
	useDeprecatedNextContext: !1,
}
var Dr = {
	setTimeout(e, t, ...n) {
		let { delegate: r } = Dr
		return r?.setTimeout ? r.setTimeout(e, t, ...n) : setTimeout(e, t, ...n)
	},
	clearTimeout(e) {
		let { delegate: t } = Dr
		return (t?.clearTimeout || clearTimeout)(e)
	},
	delegate: void 0,
}
function Ds(e) {
	Dr.setTimeout(() => {
		let { onUnhandledError: t } = Je
		if (t) t(e)
		else throw e
	})
}
function zi() {}
var Wg = nl('C', void 0, void 0)
function Gg(e) {
	return nl('E', void 0, e)
}
function qg(e) {
	return nl('N', e, void 0)
}
function nl(e, t, n) {
	return { kind: e, value: t, error: n }
}
var $n = null
function br(e) {
	if (Je.useDeprecatedSynchronousErrorHandling) {
		let t = !$n
		if ((t && ($n = { errorThrown: !1, error: null }), e(), t)) {
			let { errorThrown: n, error: r } = $n
			if ((($n = null), n)) throw r
		}
	} else e()
}
function Kg(e) {
	Je.useDeprecatedSynchronousErrorHandling &&
		$n &&
		(($n.errorThrown = !0), ($n.error = e))
}
var Hn = class extends X {
		constructor(t) {
			super(),
				(this.isStopped = !1),
				t
					? ((this.destination = t), ws(t) && t.add(this))
					: (this.destination = Hb)
		}
		static create(t, n, r) {
			return new un(t, n, r)
		}
		next(t) {
			this.isStopped ? il(qg(t), this) : this._next(t)
		}
		error(t) {
			this.isStopped ? il(Gg(t), this) : ((this.isStopped = !0), this._error(t))
		}
		complete() {
			this.isStopped ? il(Wg, this) : ((this.isStopped = !0), this._complete())
		}
		unsubscribe() {
			this.closed ||
				((this.isStopped = !0), super.unsubscribe(), (this.destination = null))
		}
		_next(t) {
			this.destination.next(t)
		}
		_error(t) {
			try {
				this.destination.error(t)
			} finally {
				this.unsubscribe()
			}
		}
		_complete() {
			try {
				this.destination.complete()
			} finally {
				this.unsubscribe()
			}
		}
	},
	Bb = Function.prototype.bind
function rl(e, t) {
	return Bb.call(e, t)
}
var ol = class {
		constructor(t) {
			this.partialObserver = t
		}
		next(t) {
			let { partialObserver: n } = this
			if (n.next)
				try {
					n.next(t)
				} catch (r) {
					bs(r)
				}
		}
		error(t) {
			let { partialObserver: n } = this
			if (n.error)
				try {
					n.error(t)
				} catch (r) {
					bs(r)
				}
			else bs(t)
		}
		complete() {
			let { partialObserver: t } = this
			if (t.complete)
				try {
					t.complete()
				} catch (n) {
					bs(n)
				}
		}
	},
	un = class extends Hn {
		constructor(t, n, r) {
			super()
			let i
			if (N(t) || !t)
				i = { next: t ?? void 0, error: n ?? void 0, complete: r ?? void 0 }
			else {
				let o
				this && Je.useDeprecatedNextContext
					? ((o = Object.create(t)),
					  (o.unsubscribe = () => this.unsubscribe()),
					  (i = {
							next: t.next && rl(t.next, o),
							error: t.error && rl(t.error, o),
							complete: t.complete && rl(t.complete, o),
					  }))
					: (i = t)
			}
			this.destination = new ol(i)
		}
	}
function bs(e) {
	Je.useDeprecatedSynchronousErrorHandling ? Kg(e) : Ds(e)
}
function $b(e) {
	throw e
}
function il(e, t) {
	let { onStoppedNotification: n } = Je
	n && Dr.setTimeout(() => n(e, t))
}
var Hb = { closed: !0, next: zi, error: $b, complete: zi }
var Cr = (typeof Symbol == 'function' && Symbol.observable) || '@@observable'
function Le(e) {
	return e
}
function sl(...e) {
	return al(e)
}
function al(e) {
	return e.length === 0
		? Le
		: e.length === 1
		? e[0]
		: function (n) {
				return e.reduce((r, i) => i(r), n)
		  }
}
var P = (() => {
	class e {
		constructor(n) {
			n && (this._subscribe = n)
		}
		lift(n) {
			let r = new e()
			return (r.source = this), (r.operator = n), r
		}
		subscribe(n, r, i) {
			let o = Wb(n) ? n : new un(n, r, i)
			return (
				br(() => {
					let { operator: s, source: a } = this
					o.add(
						s ? s.call(o, a) : a ? this._subscribe(o) : this._trySubscribe(o)
					)
				}),
				o
			)
		}
		_trySubscribe(n) {
			try {
				return this._subscribe(n)
			} catch (r) {
				n.error(r)
			}
		}
		forEach(n, r) {
			return (
				(r = Yg(r)),
				new r((i, o) => {
					let s = new un({
						next: (a) => {
							try {
								n(a)
							} catch (c) {
								o(c), s.unsubscribe()
							}
						},
						error: o,
						complete: i,
					})
					this.subscribe(s)
				})
			)
		}
		_subscribe(n) {
			var r
			return (r = this.source) === null || r === void 0
				? void 0
				: r.subscribe(n)
		}
		[Cr]() {
			return this
		}
		pipe(...n) {
			return al(n)(this)
		}
		toPromise(n) {
			return (
				(n = Yg(n)),
				new n((r, i) => {
					let o
					this.subscribe(
						(s) => (o = s),
						(s) => i(s),
						() => r(o)
					)
				})
			)
		}
	}
	return (e.create = (t) => new e(t)), e
})()
function Yg(e) {
	var t
	return (t = e ?? Je.Promise) !== null && t !== void 0 ? t : Promise
}
function zb(e) {
	return e && N(e.next) && N(e.error) && N(e.complete)
}
function Wb(e) {
	return (e && e instanceof Hn) || (zb(e) && ws(e))
}
function cl(e) {
	return N(e?.lift)
}
function B(e) {
	return (t) => {
		if (cl(t))
			return t.lift(function (n) {
				try {
					return e(n, this)
				} catch (r) {
					this.error(r)
				}
			})
		throw new TypeError('Unable to lift unknown Observable type')
	}
}
function V(e, t, n, r, i) {
	return new ul(e, t, n, r, i)
}
var ul = class extends Hn {
	constructor(t, n, r, i, o, s) {
		super(t),
			(this.onFinalize = o),
			(this.shouldUnsubscribe = s),
			(this._next = n
				? function (a) {
						try {
							n(a)
						} catch (c) {
							t.error(c)
						}
				  }
				: super._next),
			(this._error = i
				? function (a) {
						try {
							i(a)
						} catch (c) {
							t.error(c)
						} finally {
							this.unsubscribe()
						}
				  }
				: super._error),
			(this._complete = r
				? function () {
						try {
							r()
						} catch (a) {
							t.error(a)
						} finally {
							this.unsubscribe()
						}
				  }
				: super._complete)
	}
	unsubscribe() {
		var t
		if (!this.shouldUnsubscribe || this.shouldUnsubscribe()) {
			let { closed: n } = this
			super.unsubscribe(),
				!n && ((t = this.onFinalize) === null || t === void 0 || t.call(this))
		}
	}
}
function Tr() {
	return B((e, t) => {
		let n = null
		e._refCount++
		let r = V(t, void 0, void 0, void 0, () => {
			if (!e || e._refCount <= 0 || 0 < --e._refCount) {
				n = null
				return
			}
			let i = e._connection,
				o = n
			;(n = null), i && (!o || i === o) && i.unsubscribe(), t.unsubscribe()
		})
		e.subscribe(r), r.closed || (n = e.connect())
	})
}
var Sr = class extends P {
	constructor(t, n) {
		super(),
			(this.source = t),
			(this.subjectFactory = n),
			(this._subject = null),
			(this._refCount = 0),
			(this._connection = null),
			cl(t) && (this.lift = t.lift)
	}
	_subscribe(t) {
		return this.getSubject().subscribe(t)
	}
	getSubject() {
		let t = this._subject
		return (
			(!t || t.isStopped) && (this._subject = this.subjectFactory()),
			this._subject
		)
	}
	_teardown() {
		this._refCount = 0
		let { _connection: t } = this
		;(this._subject = this._connection = null), t?.unsubscribe()
	}
	connect() {
		let t = this._connection
		if (!t) {
			t = this._connection = new X()
			let n = this.getSubject()
			t.add(
				this.source.subscribe(
					V(
						n,
						void 0,
						() => {
							this._teardown(), n.complete()
						},
						(r) => {
							this._teardown(), n.error(r)
						},
						() => this._teardown()
					)
				)
			),
				t.closed && ((this._connection = null), (t = X.EMPTY))
		}
		return t
	}
	refCount() {
		return Tr()(this)
	}
}
var Zg = wr(
	(e) =>
		function () {
			e(this),
				(this.name = 'ObjectUnsubscribedError'),
				(this.message = 'object unsubscribed')
		}
)
var ie = (() => {
		class e extends P {
			constructor() {
				super(),
					(this.closed = !1),
					(this.currentObservers = null),
					(this.observers = []),
					(this.isStopped = !1),
					(this.hasError = !1),
					(this.thrownError = null)
			}
			lift(n) {
				let r = new Cs(this, this)
				return (r.operator = n), r
			}
			_throwIfClosed() {
				if (this.closed) throw new Zg()
			}
			next(n) {
				br(() => {
					if ((this._throwIfClosed(), !this.isStopped)) {
						this.currentObservers ||
							(this.currentObservers = Array.from(this.observers))
						for (let r of this.currentObservers) r.next(n)
					}
				})
			}
			error(n) {
				br(() => {
					if ((this._throwIfClosed(), !this.isStopped)) {
						;(this.hasError = this.isStopped = !0), (this.thrownError = n)
						let { observers: r } = this
						for (; r.length; ) r.shift().error(n)
					}
				})
			}
			complete() {
				br(() => {
					if ((this._throwIfClosed(), !this.isStopped)) {
						this.isStopped = !0
						let { observers: n } = this
						for (; n.length; ) n.shift().complete()
					}
				})
			}
			unsubscribe() {
				;(this.isStopped = this.closed = !0),
					(this.observers = this.currentObservers = null)
			}
			get observed() {
				var n
				return (
					((n = this.observers) === null || n === void 0 ? void 0 : n.length) >
					0
				)
			}
			_trySubscribe(n) {
				return this._throwIfClosed(), super._trySubscribe(n)
			}
			_subscribe(n) {
				return (
					this._throwIfClosed(),
					this._checkFinalizedStatuses(n),
					this._innerSubscribe(n)
				)
			}
			_innerSubscribe(n) {
				let { hasError: r, isStopped: i, observers: o } = this
				return r || i
					? tl
					: ((this.currentObservers = null),
					  o.push(n),
					  new X(() => {
							;(this.currentObservers = null), Bn(o, n)
					  }))
			}
			_checkFinalizedStatuses(n) {
				let { hasError: r, thrownError: i, isStopped: o } = this
				r ? n.error(i) : o && n.complete()
			}
			asObservable() {
				let n = new P()
				return (n.source = this), n
			}
		}
		return (e.create = (t, n) => new Cs(t, n)), e
	})(),
	Cs = class extends ie {
		constructor(t, n) {
			super(), (this.destination = t), (this.source = n)
		}
		next(t) {
			var n, r
			;(r =
				(n = this.destination) === null || n === void 0 ? void 0 : n.next) ===
				null ||
				r === void 0 ||
				r.call(n, t)
		}
		error(t) {
			var n, r
			;(r =
				(n = this.destination) === null || n === void 0 ? void 0 : n.error) ===
				null ||
				r === void 0 ||
				r.call(n, t)
		}
		complete() {
			var t, n
			;(n =
				(t = this.destination) === null || t === void 0
					? void 0
					: t.complete) === null ||
				n === void 0 ||
				n.call(t)
		}
		_subscribe(t) {
			var n, r
			return (r =
				(n = this.source) === null || n === void 0
					? void 0
					: n.subscribe(t)) !== null && r !== void 0
				? r
				: tl
		}
	}
var ee = class extends ie {
	constructor(t) {
		super(), (this._value = t)
	}
	get value() {
		return this.getValue()
	}
	_subscribe(t) {
		let n = super._subscribe(t)
		return !n.closed && t.next(this._value), n
	}
	getValue() {
		let { hasError: t, thrownError: n, _value: r } = this
		if (t) throw n
		return this._throwIfClosed(), r
	}
	next(t) {
		super.next((this._value = t))
	}
}
var ll = {
	now() {
		return (ll.delegate || Date).now()
	},
	delegate: void 0,
}
var Ts = class extends X {
	constructor(t, n) {
		super()
	}
	schedule(t, n = 0) {
		return this
	}
}
var Wi = {
	setInterval(e, t, ...n) {
		let { delegate: r } = Wi
		return r?.setInterval ? r.setInterval(e, t, ...n) : setInterval(e, t, ...n)
	},
	clearInterval(e) {
		let { delegate: t } = Wi
		return (t?.clearInterval || clearInterval)(e)
	},
	delegate: void 0,
}
var Ar = class extends Ts {
	constructor(t, n) {
		super(t, n), (this.scheduler = t), (this.work = n), (this.pending = !1)
	}
	schedule(t, n = 0) {
		var r
		if (this.closed) return this
		this.state = t
		let i = this.id,
			o = this.scheduler
		return (
			i != null && (this.id = this.recycleAsyncId(o, i, n)),
			(this.pending = !0),
			(this.delay = n),
			(this.id =
				(r = this.id) !== null && r !== void 0
					? r
					: this.requestAsyncId(o, this.id, n)),
			this
		)
	}
	requestAsyncId(t, n, r = 0) {
		return Wi.setInterval(t.flush.bind(t, this), r)
	}
	recycleAsyncId(t, n, r = 0) {
		if (r != null && this.delay === r && this.pending === !1) return n
		n != null && Wi.clearInterval(n)
	}
	execute(t, n) {
		if (this.closed) return new Error('executing a cancelled action')
		this.pending = !1
		let r = this._execute(t, n)
		if (r) return r
		this.pending === !1 &&
			this.id != null &&
			(this.id = this.recycleAsyncId(this.scheduler, this.id, null))
	}
	_execute(t, n) {
		let r = !1,
			i
		try {
			this.work(t)
		} catch (o) {
			;(r = !0), (i = o || new Error('Scheduled action threw falsy error'))
		}
		if (r) return this.unsubscribe(), i
	}
	unsubscribe() {
		if (!this.closed) {
			let { id: t, scheduler: n } = this,
				{ actions: r } = n
			;(this.work = this.state = this.scheduler = null),
				(this.pending = !1),
				Bn(r, this),
				t != null && (this.id = this.recycleAsyncId(n, t, null)),
				(this.delay = null),
				super.unsubscribe()
		}
	}
}
var Mr = class e {
	constructor(t, n = e.now) {
		;(this.schedulerActionCtor = t), (this.now = n)
	}
	schedule(t, n = 0, r) {
		return new this.schedulerActionCtor(this, t).schedule(r, n)
	}
}
Mr.now = ll.now
var Rr = class extends Mr {
	constructor(t, n = Mr.now) {
		super(t, n), (this.actions = []), (this._active = !1)
	}
	flush(t) {
		let { actions: n } = this
		if (this._active) {
			n.push(t)
			return
		}
		let r
		this._active = !0
		do if ((r = t.execute(t.state, t.delay))) break
		while ((t = n.shift()))
		if (((this._active = !1), r)) {
			for (; (t = n.shift()); ) t.unsubscribe()
			throw r
		}
	}
}
var dl = new Rr(Ar)
var Ss = class extends Ar {
	constructor(t, n) {
		super(t, n), (this.scheduler = t), (this.work = n)
	}
	schedule(t, n = 0) {
		return n > 0
			? super.schedule(t, n)
			: ((this.delay = n), (this.state = t), this.scheduler.flush(this), this)
	}
	execute(t, n) {
		return n > 0 || this.closed ? super.execute(t, n) : this._execute(t, n)
	}
	requestAsyncId(t, n, r = 0) {
		return (r != null && r > 0) || (r == null && this.delay > 0)
			? super.requestAsyncId(t, n, r)
			: (t.flush(this), 0)
	}
}
var As = class extends Rr {}
var fl = new As(Ss)
var Se = new P((e) => e.complete())
function Qg(e) {
	return e && N(e.schedule)
}
function Jg(e) {
	return e[e.length - 1]
}
function Ms(e) {
	return N(Jg(e)) ? e.pop() : void 0
}
function ln(e) {
	return Qg(Jg(e)) ? e.pop() : void 0
}
function Rs(e, t) {
	var n = {}
	for (var r in e)
		Object.prototype.hasOwnProperty.call(e, r) &&
			t.indexOf(r) < 0 &&
			(n[r] = e[r])
	if (e != null && typeof Object.getOwnPropertySymbols == 'function')
		for (var i = 0, r = Object.getOwnPropertySymbols(e); i < r.length; i++)
			t.indexOf(r[i]) < 0 &&
				Object.prototype.propertyIsEnumerable.call(e, r[i]) &&
				(n[r[i]] = e[r[i]])
	return n
}
function em(e, t, n, r) {
	function i(o) {
		return o instanceof n
			? o
			: new n(function (s) {
					s(o)
			  })
	}
	return new (n || (n = Promise))(function (o, s) {
		function a(l) {
			try {
				u(r.next(l))
			} catch (d) {
				s(d)
			}
		}
		function c(l) {
			try {
				u(r.throw(l))
			} catch (d) {
				s(d)
			}
		}
		function u(l) {
			l.done ? o(l.value) : i(l.value).then(a, c)
		}
		u((r = r.apply(e, t || [])).next())
	})
}
function Xg(e) {
	var t = typeof Symbol == 'function' && Symbol.iterator,
		n = t && e[t],
		r = 0
	if (n) return n.call(e)
	if (e && typeof e.length == 'number')
		return {
			next: function () {
				return (
					e && r >= e.length && (e = void 0), { value: e && e[r++], done: !e }
				)
			},
		}
	throw new TypeError(
		t ? 'Object is not iterable.' : 'Symbol.iterator is not defined.'
	)
}
function zn(e) {
	return this instanceof zn ? ((this.v = e), this) : new zn(e)
}
function tm(e, t, n) {
	if (!Symbol.asyncIterator)
		throw new TypeError('Symbol.asyncIterator is not defined.')
	var r = n.apply(e, t || []),
		i,
		o = []
	return (
		(i = Object.create(
			(typeof AsyncIterator == 'function' ? AsyncIterator : Object).prototype
		)),
		a('next'),
		a('throw'),
		a('return', s),
		(i[Symbol.asyncIterator] = function () {
			return this
		}),
		i
	)
	function s(f) {
		return function (m) {
			return Promise.resolve(m).then(f, d)
		}
	}
	function a(f, m) {
		r[f] &&
			((i[f] = function (v) {
				return new Promise(function (D, T) {
					o.push([f, v, D, T]) > 1 || c(f, v)
				})
			}),
			m && (i[f] = m(i[f])))
	}
	function c(f, m) {
		try {
			u(r[f](m))
		} catch (v) {
			h(o[0][3], v)
		}
	}
	function u(f) {
		f.value instanceof zn
			? Promise.resolve(f.value.v).then(l, d)
			: h(o[0][2], f)
	}
	function l(f) {
		c('next', f)
	}
	function d(f) {
		c('throw', f)
	}
	function h(f, m) {
		f(m), o.shift(), o.length && c(o[0][0], o[0][1])
	}
}
function nm(e) {
	if (!Symbol.asyncIterator)
		throw new TypeError('Symbol.asyncIterator is not defined.')
	var t = e[Symbol.asyncIterator],
		n
	return t
		? t.call(e)
		: ((e = typeof Xg == 'function' ? Xg(e) : e[Symbol.iterator]()),
		  (n = {}),
		  r('next'),
		  r('throw'),
		  r('return'),
		  (n[Symbol.asyncIterator] = function () {
				return this
		  }),
		  n)
	function r(o) {
		n[o] =
			e[o] &&
			function (s) {
				return new Promise(function (a, c) {
					;(s = e[o](s)), i(a, c, s.done, s.value)
				})
			}
	}
	function i(o, s, a, c) {
		Promise.resolve(c).then(function (u) {
			o({ value: u, done: a })
		}, s)
	}
}
var Ns = (e) => e && typeof e.length == 'number' && typeof e != 'function'
function Os(e) {
	return N(e?.then)
}
function ks(e) {
	return N(e[Cr])
}
function xs(e) {
	return Symbol.asyncIterator && N(e?.[Symbol.asyncIterator])
}
function Ps(e) {
	return new TypeError(
		`You provided ${
			e !== null && typeof e == 'object' ? 'an invalid object' : `'${e}'`
		} where a stream was expected. You can provide an Observable, Promise, ReadableStream, Array, AsyncIterable, or Iterable.`
	)
}
function Gb() {
	return typeof Symbol != 'function' || !Symbol.iterator
		? '@@iterator'
		: Symbol.iterator
}
var Fs = Gb()
function Ls(e) {
	return N(e?.[Fs])
}
function Vs(e) {
	return tm(this, arguments, function* () {
		let n = e.getReader()
		try {
			for (;;) {
				let { value: r, done: i } = yield zn(n.read())
				if (i) return yield zn(void 0)
				yield yield zn(r)
			}
		} finally {
			n.releaseLock()
		}
	})
}
function js(e) {
	return N(e?.getReader)
}
function oe(e) {
	if (e instanceof P) return e
	if (e != null) {
		if (ks(e)) return qb(e)
		if (Ns(e)) return Kb(e)
		if (Os(e)) return Yb(e)
		if (xs(e)) return rm(e)
		if (Ls(e)) return Zb(e)
		if (js(e)) return Qb(e)
	}
	throw Ps(e)
}
function qb(e) {
	return new P((t) => {
		let n = e[Cr]()
		if (N(n.subscribe)) return n.subscribe(t)
		throw new TypeError(
			'Provided object does not correctly implement Symbol.observable'
		)
	})
}
function Kb(e) {
	return new P((t) => {
		for (let n = 0; n < e.length && !t.closed; n++) t.next(e[n])
		t.complete()
	})
}
function Yb(e) {
	return new P((t) => {
		e.then(
			(n) => {
				t.closed || (t.next(n), t.complete())
			},
			(n) => t.error(n)
		).then(null, Ds)
	})
}
function Zb(e) {
	return new P((t) => {
		for (let n of e) if ((t.next(n), t.closed)) return
		t.complete()
	})
}
function rm(e) {
	return new P((t) => {
		Jb(e, t).catch((n) => t.error(n))
	})
}
function Qb(e) {
	return rm(Vs(e))
}
function Jb(e, t) {
	var n, r, i, o
	return em(this, void 0, void 0, function* () {
		try {
			for (n = nm(e); (r = yield n.next()), !r.done; ) {
				let s = r.value
				if ((t.next(s), t.closed)) return
			}
		} catch (s) {
			i = { error: s }
		} finally {
			try {
				r && !r.done && (o = n.return) && (yield o.call(n))
			} finally {
				if (i) throw i.error
			}
		}
		t.complete()
	})
}
function Ae(e, t, n, r = 0, i = !1) {
	let o = t.schedule(function () {
		n(), i ? e.add(this.schedule(null, r)) : this.unsubscribe()
	}, r)
	if ((e.add(o), !i)) return o
}
function dn(e, t = 0) {
	return B((n, r) => {
		n.subscribe(
			V(
				r,
				(i) => Ae(r, e, () => r.next(i), t),
				() => Ae(r, e, () => r.complete(), t),
				(i) => Ae(r, e, () => r.error(i), t)
			)
		)
	})
}
function fn(e, t = 0) {
	return B((n, r) => {
		r.add(e.schedule(() => n.subscribe(r), t))
	})
}
function im(e, t) {
	return oe(e).pipe(fn(t), dn(t))
}
function om(e, t) {
	return oe(e).pipe(fn(t), dn(t))
}
function sm(e, t) {
	return new P((n) => {
		let r = 0
		return t.schedule(function () {
			r === e.length
				? n.complete()
				: (n.next(e[r++]), n.closed || this.schedule())
		})
	})
}
function am(e, t) {
	return new P((n) => {
		let r
		return (
			Ae(n, t, () => {
				;(r = e[Fs]()),
					Ae(
						n,
						t,
						() => {
							let i, o
							try {
								;({ value: i, done: o } = r.next())
							} catch (s) {
								n.error(s)
								return
							}
							o ? n.complete() : n.next(i)
						},
						0,
						!0
					)
			}),
			() => N(r?.return) && r.return()
		)
	})
}
function Us(e, t) {
	if (!e) throw new Error('Iterable cannot be null')
	return new P((n) => {
		Ae(n, t, () => {
			let r = e[Symbol.asyncIterator]()
			Ae(
				n,
				t,
				() => {
					r.next().then((i) => {
						i.done ? n.complete() : n.next(i.value)
					})
				},
				0,
				!0
			)
		})
	})
}
function cm(e, t) {
	return Us(Vs(e), t)
}
function um(e, t) {
	if (e != null) {
		if (ks(e)) return im(e, t)
		if (Ns(e)) return sm(e, t)
		if (Os(e)) return om(e, t)
		if (xs(e)) return Us(e, t)
		if (Ls(e)) return am(e, t)
		if (js(e)) return cm(e, t)
	}
	throw Ps(e)
}
function Z(e, t) {
	return t ? um(e, t) : oe(e)
}
function C(...e) {
	let t = ln(e)
	return Z(e, t)
}
function yt(e, t) {
	let n = N(e) ? e : () => e,
		r = (i) => i.error(n())
	return new P(t ? (i) => t.schedule(r, 0, i) : r)
}
function hl(e) {
	return !!e && (e instanceof P || (N(e.lift) && N(e.subscribe)))
}
var Xe = wr(
	(e) =>
		function () {
			e(this),
				(this.name = 'EmptyError'),
				(this.message = 'no elements in sequence')
		}
)
function pl(e, t) {
	let n = typeof t == 'object'
	return new Promise((r, i) => {
		let o = new un({
			next: (s) => {
				r(s), o.unsubscribe()
			},
			error: i,
			complete: () => {
				n ? r(t.defaultValue) : i(new Xe())
			},
		})
		e.subscribe(o)
	})
}
function k(e, t) {
	return B((n, r) => {
		let i = 0
		n.subscribe(
			V(r, (o) => {
				r.next(e.call(t, o, i++))
			})
		)
	})
}
var { isArray: Xb } = Array
function eC(e, t) {
	return Xb(t) ? e(...t) : e(t)
}
function Bs(e) {
	return k((t) => eC(e, t))
}
var { isArray: tC } = Array,
	{ getPrototypeOf: nC, prototype: rC, keys: iC } = Object
function $s(e) {
	if (e.length === 1) {
		let t = e[0]
		if (tC(t)) return { args: t, keys: null }
		if (oC(t)) {
			let n = iC(t)
			return { args: n.map((r) => t[r]), keys: n }
		}
	}
	return { args: e, keys: null }
}
function oC(e) {
	return e && typeof e == 'object' && nC(e) === rC
}
function Hs(e, t) {
	return e.reduce((n, r, i) => ((n[r] = t[i]), n), {})
}
function Gi(...e) {
	let t = ln(e),
		n = Ms(e),
		{ args: r, keys: i } = $s(e)
	if (r.length === 0) return Z([], t)
	let o = new P(sC(r, t, i ? (s) => Hs(i, s) : Le))
	return n ? o.pipe(Bs(n)) : o
}
function sC(e, t, n = Le) {
	return (r) => {
		lm(
			t,
			() => {
				let { length: i } = e,
					o = new Array(i),
					s = i,
					a = i
				for (let c = 0; c < i; c++)
					lm(
						t,
						() => {
							let u = Z(e[c], t),
								l = !1
							u.subscribe(
								V(
									r,
									(d) => {
										;(o[c] = d), l || ((l = !0), a--), a || r.next(n(o.slice()))
									},
									() => {
										--s || r.complete()
									}
								)
							)
						},
						r
					)
			},
			r
		)
	}
}
function lm(e, t, n) {
	e ? Ae(n, e, t) : t()
}
function dm(e, t, n, r, i, o, s, a) {
	let c = [],
		u = 0,
		l = 0,
		d = !1,
		h = () => {
			d && !c.length && !u && t.complete()
		},
		f = (v) => (u < r ? m(v) : c.push(v)),
		m = (v) => {
			o && t.next(v), u++
			let D = !1
			oe(n(v, l++)).subscribe(
				V(
					t,
					(T) => {
						i?.(T), o ? f(T) : t.next(T)
					},
					() => {
						D = !0
					},
					void 0,
					() => {
						if (D)
							try {
								for (u--; c.length && u < r; ) {
									let T = c.shift()
									s ? Ae(t, s, () => m(T)) : m(T)
								}
								h()
							} catch (T) {
								t.error(T)
							}
					}
				)
			)
		}
	return (
		e.subscribe(
			V(t, f, () => {
				;(d = !0), h()
			})
		),
		() => {
			a?.()
		}
	)
}
function se(e, t, n = 1 / 0) {
	return N(t)
		? se((r, i) => k((o, s) => t(r, o, i, s))(oe(e(r, i))), n)
		: (typeof t == 'number' && (n = t), B((r, i) => dm(r, i, e, n)))
}
function Nr(e = 1 / 0) {
	return se(Le, e)
}
function fm() {
	return Nr(1)
}
function Or(...e) {
	return fm()(Z(e, ln(e)))
}
function zs(e) {
	return new P((t) => {
		oe(e()).subscribe(t)
	})
}
function gl(...e) {
	let t = Ms(e),
		{ args: n, keys: r } = $s(e),
		i = new P((o) => {
			let { length: s } = n
			if (!s) {
				o.complete()
				return
			}
			let a = new Array(s),
				c = s,
				u = s
			for (let l = 0; l < s; l++) {
				let d = !1
				oe(n[l]).subscribe(
					V(
						o,
						(h) => {
							d || ((d = !0), u--), (a[l] = h)
						},
						() => c--,
						void 0,
						() => {
							;(!c || !d) && (u || o.next(r ? Hs(r, a) : a), o.complete())
						}
					)
				)
			}
		})
	return t ? i.pipe(Bs(t)) : i
}
function Me(e, t) {
	return B((n, r) => {
		let i = 0
		n.subscribe(V(r, (o) => e.call(t, o, i++) && r.next(o)))
	})
}
function et(e) {
	return B((t, n) => {
		let r = null,
			i = !1,
			o
		;(r = t.subscribe(
			V(n, void 0, void 0, (s) => {
				;(o = oe(e(s, et(e)(t)))),
					r ? (r.unsubscribe(), (r = null), o.subscribe(n)) : (i = !0)
			})
		)),
			i && (r.unsubscribe(), (r = null), o.subscribe(n))
	})
}
function hm(e, t, n, r, i) {
	return (o, s) => {
		let a = n,
			c = t,
			u = 0
		o.subscribe(
			V(
				s,
				(l) => {
					let d = u++
					;(c = a ? e(c, l, d) : ((a = !0), l)), r && s.next(c)
				},
				i &&
					(() => {
						a && s.next(c), s.complete()
					})
			)
		)
	}
}
function Ut(e, t) {
	return N(t) ? se(e, t, 1) : se(e, 1)
}
function hn(e) {
	return B((t, n) => {
		let r = !1
		t.subscribe(
			V(
				n,
				(i) => {
					;(r = !0), n.next(i)
				},
				() => {
					r || n.next(e), n.complete()
				}
			)
		)
	})
}
function Bt(e) {
	return e <= 0
		? () => Se
		: B((t, n) => {
				let r = 0
				t.subscribe(
					V(n, (i) => {
						++r <= e && (n.next(i), e <= r && n.complete())
					})
				)
		  })
}
function Ws(e = aC) {
	return B((t, n) => {
		let r = !1
		t.subscribe(
			V(
				n,
				(i) => {
					;(r = !0), n.next(i)
				},
				() => (r ? n.complete() : n.error(e()))
			)
		)
	})
}
function aC() {
	return new Xe()
}
function pn(e) {
	return B((t, n) => {
		try {
			t.subscribe(n)
		} finally {
			n.add(e)
		}
	})
}
function $t(e, t) {
	let n = arguments.length >= 2
	return (r) =>
		r.pipe(
			e ? Me((i, o) => e(i, o, r)) : Le,
			Bt(1),
			n ? hn(t) : Ws(() => new Xe())
		)
}
function kr(e) {
	return e <= 0
		? () => Se
		: B((t, n) => {
				let r = []
				t.subscribe(
					V(
						n,
						(i) => {
							r.push(i), e < r.length && r.shift()
						},
						() => {
							for (let i of r) n.next(i)
							n.complete()
						},
						void 0,
						() => {
							r = null
						}
					)
				)
		  })
}
function ml(e, t) {
	let n = arguments.length >= 2
	return (r) =>
		r.pipe(
			e ? Me((i, o) => e(i, o, r)) : Le,
			kr(1),
			n ? hn(t) : Ws(() => new Xe())
		)
}
function vl(e, t) {
	return B(hm(e, t, arguments.length >= 2, !0))
}
function yl(...e) {
	let t = ln(e)
	return B((n, r) => {
		;(t ? Or(e, n, t) : Or(e, n)).subscribe(r)
	})
}
function Re(e, t) {
	return B((n, r) => {
		let i = null,
			o = 0,
			s = !1,
			a = () => s && !i && r.complete()
		n.subscribe(
			V(
				r,
				(c) => {
					i?.unsubscribe()
					let u = 0,
						l = o++
					oe(e(c, l)).subscribe(
						(i = V(
							r,
							(d) => r.next(t ? t(c, d, l, u++) : d),
							() => {
								;(i = null), a()
							}
						))
					)
				},
				() => {
					;(s = !0), a()
				}
			)
		)
	})
}
function El(e) {
	return B((t, n) => {
		oe(e).subscribe(V(n, () => n.complete(), zi)), !n.closed && t.subscribe(n)
	})
}
function J(e, t, n) {
	let r = N(e) || t || n ? { next: e, error: t, complete: n } : e
	return r
		? B((i, o) => {
				var s
				;(s = r.subscribe) === null || s === void 0 || s.call(r)
				let a = !0
				i.subscribe(
					V(
						o,
						(c) => {
							var u
							;(u = r.next) === null || u === void 0 || u.call(r, c), o.next(c)
						},
						() => {
							var c
							;(a = !1),
								(c = r.complete) === null || c === void 0 || c.call(r),
								o.complete()
						},
						(c) => {
							var u
							;(a = !1),
								(u = r.error) === null || u === void 0 || u.call(r, c),
								o.error(c)
						},
						() => {
							var c, u
							a && ((c = r.unsubscribe) === null || c === void 0 || c.call(r)),
								(u = r.finalize) === null || u === void 0 || u.call(r)
						}
					)
				)
		  })
		: Le
}
var bl = { JSACTION: 'jsaction' },
	Cl = { JSACTION: '__jsaction', OWNER: '__owner' },
	vm = {}
function cC(e) {
	return e[Cl.JSACTION]
}
function pm(e, t) {
	e[Cl.JSACTION] = t
}
function uC(e) {
	return vm[e]
}
function lC(e, t) {
	vm[e] = t
}
var b = {
		CLICK: 'click',
		CLICKMOD: 'clickmod',
		DBLCLICK: 'dblclick',
		FOCUS: 'focus',
		FOCUSIN: 'focusin',
		BLUR: 'blur',
		FOCUSOUT: 'focusout',
		SUBMIT: 'submit',
		KEYDOWN: 'keydown',
		KEYPRESS: 'keypress',
		KEYUP: 'keyup',
		MOUSEOVER: 'mouseover',
		MOUSEOUT: 'mouseout',
		MOUSEENTER: 'mouseenter',
		MOUSELEAVE: 'mouseleave',
		POINTEROVER: 'pointerover',
		POINTEROUT: 'pointerout',
		POINTERENTER: 'pointerenter',
		POINTERLEAVE: 'pointerleave',
		ERROR: 'error',
		LOAD: 'load',
		TOUCHSTART: 'touchstart',
		TOUCHEND: 'touchend',
		TOUCHMOVE: 'touchmove',
		TOGGLE: 'toggle',
	},
	dC = [b.MOUSEENTER, b.MOUSELEAVE, 'pointerenter', 'pointerleave'],
	WH = [
		b.CLICK,
		b.DBLCLICK,
		b.FOCUSIN,
		b.FOCUSOUT,
		b.KEYDOWN,
		b.KEYUP,
		b.KEYPRESS,
		b.MOUSEOVER,
		b.MOUSEOUT,
		b.SUBMIT,
		b.TOUCHSTART,
		b.TOUCHEND,
		b.TOUCHMOVE,
		'touchcancel',
		'auxclick',
		'change',
		'compositionstart',
		'compositionupdate',
		'compositionend',
		'beforeinput',
		'input',
		'select',
		'copy',
		'cut',
		'paste',
		'mousedown',
		'mouseup',
		'wheel',
		'contextmenu',
		'dragover',
		'dragenter',
		'dragleave',
		'drop',
		'dragstart',
		'dragend',
		'pointerdown',
		'pointermove',
		'pointerup',
		'pointercancel',
		'pointerover',
		'pointerout',
		'gotpointercapture',
		'lostpointercapture',
		'ended',
		'loadedmetadata',
		'pagehide',
		'pageshow',
		'visibilitychange',
		'beforematch',
	],
	fC = [b.FOCUS, b.BLUR, b.ERROR, b.LOAD, b.TOGGLE],
	Tl = (e) => fC.indexOf(e) >= 0
function hC(e) {
	return e === b.MOUSEENTER
		? b.MOUSEOVER
		: e === b.MOUSELEAVE
		? b.MOUSEOUT
		: e === b.POINTERENTER
		? b.POINTEROVER
		: e === b.POINTERLEAVE
		? b.POINTEROUT
		: e
}
function pC(e, t, n, r) {
	let i = !1
	Tl(t) && (i = !0)
	let o = typeof r == 'boolean' ? { capture: i, passive: r } : i
	return (
		e.addEventListener(t, n, o),
		{ eventType: t, handler: n, capture: i, passive: r }
	)
}
function gC(e, t) {
	if (e.removeEventListener) {
		let n = typeof t.passive == 'boolean' ? { capture: t.capture } : t.capture
		e.removeEventListener(t.eventType, t.handler, n)
	} else e.detachEvent && e.detachEvent(`on${t.eventType}`, t.handler)
}
function mC(e) {
	e.preventDefault ? e.preventDefault() : (e.returnValue = !1)
}
var gm = typeof navigator < 'u' && /Macintosh/.test(navigator.userAgent)
function vC(e) {
	return e.which === 2 || (e.which == null && e.button === 4)
}
function yC(e) {
	return (gm && e.metaKey) || (!gm && e.ctrlKey) || vC(e) || e.shiftKey
}
function EC(e, t, n) {
	let r = e.relatedTarget
	return (
		((e.type === b.MOUSEOVER && t === b.MOUSEENTER) ||
			(e.type === b.MOUSEOUT && t === b.MOUSELEAVE) ||
			(e.type === b.POINTEROVER && t === b.POINTERENTER) ||
			(e.type === b.POINTEROUT && t === b.POINTERLEAVE)) &&
		(!r || (r !== n && !n.contains(r)))
	)
}
function _C(e, t) {
	let n = {}
	for (let r in e) {
		if (r === 'srcElement' || r === 'target') continue
		let i = r,
			o = e[i]
		typeof o != 'function' && (n[i] = o)
	}
	return (
		e.type === b.MOUSEOVER
			? (n.type = b.MOUSEENTER)
			: e.type === b.MOUSEOUT
			? (n.type = b.MOUSELEAVE)
			: e.type === b.POINTEROVER
			? (n.type = b.POINTERENTER)
			: (n.type = b.POINTERLEAVE),
		(n.target = n.srcElement = t),
		(n.bubbles = !1),
		(n._originalEvent = e),
		n
	)
}
var IC = typeof navigator < 'u' && /iPhone|iPad|iPod/.test(navigator.userAgent),
	Ys = class {
		element
		handlerInfos = []
		constructor(t) {
			this.element = t
		}
		addEventListener(t, n, r) {
			IC && (this.element.style.cursor = 'pointer'),
				this.handlerInfos.push(pC(this.element, t, n(this.element), r))
		}
		cleanUp() {
			for (let t = 0; t < this.handlerInfos.length; t++)
				gC(this.element, this.handlerInfos[t])
			this.handlerInfos = []
		}
	},
	wC = { EVENT_ACTION_SEPARATOR: ':' }
function gn(e) {
	return e.eventType
}
function Sl(e, t) {
	e.eventType = t
}
function qs(e) {
	return e.event
}
function ym(e, t) {
	e.event = t
}
function Em(e) {
	return e.targetElement
}
function _m(e, t) {
	e.targetElement = t
}
function Im(e) {
	return e.eic
}
function DC(e, t) {
	e.eic = t
}
function bC(e) {
	return e.timeStamp
}
function CC(e, t) {
	e.timeStamp = t
}
function Ks(e) {
	return e.eia
}
function wm(e, t, n) {
	e.eia = [t, n]
}
function _l(e) {
	e.eia = void 0
}
function Gs(e) {
	return e[1]
}
function TC(e) {
	return e.eirp
}
function Dm(e, t) {
	e.eirp = t
}
function bm(e) {
	return e.eir
}
function Cm(e, t) {
	e.eir = t
}
function Tm(e) {
	return {
		eventType: e.eventType,
		event: e.event,
		targetElement: e.targetElement,
		eic: e.eic,
		eia: e.eia,
		timeStamp: e.timeStamp,
		eirp: e.eirp,
		eiack: e.eiack,
		eir: e.eir,
	}
}
function SC(e, t, n, r, i, o, s, a) {
	return {
		eventType: e,
		event: t,
		targetElement: n,
		eic: r,
		timeStamp: i,
		eia: o,
		eirp: s,
		eiack: a,
	}
}
var Il = class e {
		eventInfo
		constructor(t) {
			this.eventInfo = t
		}
		getEventType() {
			return gn(this.eventInfo)
		}
		setEventType(t) {
			Sl(this.eventInfo, t)
		}
		getEvent() {
			return qs(this.eventInfo)
		}
		setEvent(t) {
			ym(this.eventInfo, t)
		}
		getTargetElement() {
			return Em(this.eventInfo)
		}
		setTargetElement(t) {
			_m(this.eventInfo, t)
		}
		getContainer() {
			return Im(this.eventInfo)
		}
		setContainer(t) {
			DC(this.eventInfo, t)
		}
		getTimestamp() {
			return bC(this.eventInfo)
		}
		setTimestamp(t) {
			CC(this.eventInfo, t)
		}
		getAction() {
			let t = Ks(this.eventInfo)
			if (t) return { name: t[0], element: t[1] }
		}
		setAction(t) {
			if (!t) {
				_l(this.eventInfo)
				return
			}
			wm(this.eventInfo, t.name, t.element)
		}
		getIsReplay() {
			return TC(this.eventInfo)
		}
		setIsReplay(t) {
			Dm(this.eventInfo, t)
		}
		getResolved() {
			return bm(this.eventInfo)
		}
		setResolved(t) {
			Cm(this.eventInfo, t)
		}
		clone() {
			return new e(Tm(this.eventInfo))
		}
	},
	AC = {},
	MC = /\s*;\s*/,
	RC = b.CLICK,
	wl = class {
		a11yClickSupport = !1
		clickModSupport = !0
		syntheticMouseEventSupport
		updateEventInfoForA11yClick = void 0
		preventDefaultForA11yClick = void 0
		populateClickOnlyAction = void 0
		constructor({
			syntheticMouseEventSupport: t = !1,
			clickModSupport: n = !0,
		} = {}) {
			;(this.syntheticMouseEventSupport = t), (this.clickModSupport = n)
		}
		resolveEventType(t) {
			this.clickModSupport && gn(t) === b.CLICK && yC(qs(t))
				? Sl(t, b.CLICKMOD)
				: this.a11yClickSupport && this.updateEventInfoForA11yClick(t)
		}
		resolveAction(t) {
			bm(t) || (this.populateAction(t, Em(t)), Cm(t, !0))
		}
		resolveParentAction(t) {
			let n = Ks(t),
				r = n && Gs(n)
			_l(t)
			let i = r && this.getParentNode(r)
			i && this.populateAction(t, i)
		}
		populateAction(t, n) {
			let r = n
			for (
				;
				r &&
				r !== Im(t) &&
				(r.nodeType === Node.ELEMENT_NODE && this.populateActionOnElement(r, t),
				!Ks(t));

			)
				r = this.getParentNode(r)
			let i = Ks(t)
			if (
				i &&
				(this.a11yClickSupport && this.preventDefaultForA11yClick(t),
				this.syntheticMouseEventSupport &&
					(gn(t) === b.MOUSEENTER ||
						gn(t) === b.MOUSELEAVE ||
						gn(t) === b.POINTERENTER ||
						gn(t) === b.POINTERLEAVE))
			)
				if (EC(qs(t), gn(t), Gs(i))) {
					let o = _C(qs(t), Gs(i))
					ym(t, o), _m(t, Gs(i))
				} else _l(t)
		}
		getParentNode(t) {
			let n = t[Cl.OWNER]
			if (n) return n
			let r = t.parentNode
			return r?.nodeName === '#document-fragment' ? r?.host ?? null : r
		}
		populateActionOnElement(t, n) {
			let r = this.parseActions(t),
				i = r[gn(n)]
			i !== void 0 && wm(n, i, t),
				this.a11yClickSupport && this.populateClickOnlyAction(t, n, r)
		}
		parseActions(t) {
			let n = cC(t)
			if (!n) {
				let r = t.getAttribute(bl.JSACTION)
				if (!r) (n = AC), pm(t, n)
				else {
					if (((n = uC(r)), !n)) {
						n = {}
						let i = r.split(MC)
						for (let o = 0; o < i.length; o++) {
							let s = i[o]
							if (!s) continue
							let a = s.indexOf(wC.EVENT_ACTION_SEPARATOR),
								c = a !== -1,
								u = c ? s.substr(0, a).trim() : RC,
								l = c ? s.substr(a + 1).trim() : s
							n[u] = l
						}
						lC(r, n)
					}
					pm(t, n)
				}
			}
			return n
		}
		addA11yClickSupport(t, n, r) {
			;(this.a11yClickSupport = !0),
				(this.updateEventInfoForA11yClick = t),
				(this.preventDefaultForA11yClick = n),
				(this.populateClickOnlyAction = r)
		}
	},
	Sm = (function (e) {
		return (
			(e[(e.I_AM_THE_JSACTION_FRAMEWORK = 0)] = 'I_AM_THE_JSACTION_FRAMEWORK'),
			e
		)
	})(Sm || {}),
	Dl = class {
		dispatchDelegate
		actionResolver
		eventReplayer
		eventReplayScheduled = !1
		replayEventInfoWrappers = []
		constructor(t, { actionResolver: n, eventReplayer: r } = {}) {
			;(this.dispatchDelegate = t),
				(this.actionResolver = n),
				(this.eventReplayer = r)
		}
		dispatch(t) {
			let n = new Il(t)
			this.actionResolver?.resolveEventType(t),
				this.actionResolver?.resolveAction(t)
			let r = n.getAction()
			if (
				(r && NC(r.element, n) && mC(n.getEvent()),
				this.eventReplayer && n.getIsReplay())
			) {
				this.scheduleEventInfoWrapperReplay(n)
				return
			}
			this.dispatchDelegate(n)
		}
		scheduleEventInfoWrapperReplay(t) {
			this.replayEventInfoWrappers.push(t),
				!this.eventReplayScheduled &&
					((this.eventReplayScheduled = !0),
					Promise.resolve().then(() => {
						;(this.eventReplayScheduled = !1),
							this.eventReplayer(this.replayEventInfoWrappers)
					}))
		}
	}
function NC(e, t) {
	return (
		e.tagName === 'A' &&
		(t.getEventType() === b.CLICK || t.getEventType() === b.CLICKMOD)
	)
}
var Am = Symbol.for('propagationStopped'),
	Al = { REPLAY: 101 }
var OC = '`preventDefault` called during event replay.'
var kC = '`composedPath` called during event replay.',
	Zs = class {
		dispatchDelegate
		clickModSupport
		actionResolver
		dispatcher
		constructor(t, n = !0) {
			;(this.dispatchDelegate = t),
				(this.clickModSupport = n),
				(this.actionResolver = new wl({ clickModSupport: n })),
				(this.dispatcher = new Dl(
					(r) => {
						this.dispatchToDelegate(r)
					},
					{ actionResolver: this.actionResolver }
				))
		}
		dispatch(t) {
			this.dispatcher.dispatch(t)
		}
		dispatchToDelegate(t) {
			for (t.getIsReplay() && FC(t), xC(t); t.getAction(); ) {
				if (
					(LC(t),
					(Tl(t.getEventType()) &&
						t.getAction().element !== t.getTargetElement()) ||
						(this.dispatchDelegate(t.getEvent(), t.getAction().name), PC(t)))
				)
					return
				this.actionResolver.resolveParentAction(t.eventInfo)
			}
		}
	}
function xC(e) {
	let t = e.getEvent(),
		n = e.getEvent().stopPropagation.bind(t),
		r = () => {
			;(t[Am] = !0), n()
		}
	Wn(t, 'stopPropagation', r), Wn(t, 'stopImmediatePropagation', r)
}
function PC(e) {
	return !!e.getEvent()[Am]
}
function FC(e) {
	let t = e.getEvent(),
		n = e.getTargetElement(),
		r = t.preventDefault.bind(t)
	Wn(t, 'target', n),
		Wn(t, 'eventPhase', Al.REPLAY),
		Wn(t, 'preventDefault', () => {
			throw (r(), new Error(OC + ''))
		}),
		Wn(t, 'composedPath', () => {
			throw new Error(kC + '')
		})
}
function LC(e) {
	let t = e.getEvent(),
		n = e.getAction()?.element
	n && Wn(t, 'currentTarget', n, { configurable: !0 })
}
function Wn(e, t, n, { configurable: r = !1 } = {}) {
	Object.defineProperty(e, t, { value: n, configurable: r })
}
function Mm(e, t) {
	e.ecrd((n) => {
		t.dispatch(n)
	}, Sm.I_AM_THE_JSACTION_FRAMEWORK)
}
function VC(e) {
	return e?.q ?? []
}
function jC(e) {
	e && (mm(e.c, e.et, e.h), mm(e.c, e.etc, e.h, !0))
}
function mm(e, t, n, r) {
	for (let i = 0; i < t.length; i++) e.removeEventListener(t[i], n, r)
}
var UC = !1,
	Rm = (() => {
		class e {
			static MOUSE_SPECIAL_SUPPORT = UC
			containerManager
			eventHandlers = {}
			browserEventTypeToExtraEventTypes = {}
			dispatcher = null
			queuedEventInfos = []
			constructor(n) {
				this.containerManager = n
			}
			handleEvent(n, r, i) {
				let o = SC(n, r, r.target, i, Date.now())
				this.handleEventInfo(o)
			}
			handleEventInfo(n) {
				if (!this.dispatcher) {
					Dm(n, !0), this.queuedEventInfos?.push(n)
					return
				}
				this.dispatcher(n)
			}
			addEvent(n, r, i) {
				if (
					n in this.eventHandlers ||
					!this.containerManager ||
					(!e.MOUSE_SPECIAL_SUPPORT && dC.indexOf(n) >= 0)
				)
					return
				let o = (a, c, u) => {
					this.handleEvent(a, c, u)
				}
				this.eventHandlers[n] = o
				let s = hC(r || n)
				if (s !== n) {
					let a = this.browserEventTypeToExtraEventTypes[s] || []
					a.push(n), (this.browserEventTypeToExtraEventTypes[s] = a)
				}
				this.containerManager.addEventListener(
					s,
					(a) => (c) => {
						o(n, c, a)
					},
					i
				)
			}
			replayEarlyEvents(n = window._ejsa) {
				n && (this.replayEarlyEventInfos(n.q), jC(n), delete window._ejsa)
			}
			replayEarlyEventInfos(n) {
				for (let r = 0; r < n.length; r++) {
					let i = n[r],
						o = this.getEventTypesForBrowserEventType(i.eventType)
					for (let s = 0; s < o.length; s++) {
						let a = Tm(i)
						Sl(a, o[s]), this.handleEventInfo(a)
					}
				}
			}
			getEventTypesForBrowserEventType(n) {
				let r = []
				return (
					this.eventHandlers[n] && r.push(n),
					this.browserEventTypeToExtraEventTypes[n] &&
						r.push(...this.browserEventTypeToExtraEventTypes[n]),
					r
				)
			}
			handler(n) {
				return this.eventHandlers[n]
			}
			cleanUp() {
				this.containerManager?.cleanUp(),
					(this.containerManager = null),
					(this.eventHandlers = {}),
					(this.browserEventTypeToExtraEventTypes = {}),
					(this.dispatcher = null),
					(this.queuedEventInfos = [])
			}
			registerDispatcher(n, r) {
				this.ecrd(n, r)
			}
			ecrd(n, r) {
				if (((this.dispatcher = n), this.queuedEventInfos?.length)) {
					for (let i = 0; i < this.queuedEventInfos.length; i++)
						this.handleEventInfo(this.queuedEventInfos[i])
					this.queuedEventInfos = null
				}
			}
		}
		return e
	})()
function Nm(e, t = window) {
	return VC(t._ejsas?.[e])
}
function Ml(e, t = window) {
	t._ejsas && (t._ejsas[e] = void 0)
}
var Rv =
		'https://angular.dev/best-practices/security#preventing-cross-site-scripting-xss',
	w = class extends Error {
		code
		constructor(t, n) {
			super(Fa(t, n)), (this.code = t)
		}
	}
function Fa(e, t) {
	return `${`NG0${Math.abs(e)}`}${t ? ': ' + t : ''}`
}
var Nv = Symbol('InputSignalNode#UNSET'),
	BC = L(y({}, Ju), {
		transformFn: void 0,
		applyValueToInputSignal(e, t) {
			_s(e, t)
		},
	})
function Ov(e, t) {
	let n = Object.create(BC)
	;(n.value = e), (n.transformFn = t?.transform)
	function r() {
		if ((ms(n), n.value === Nv)) throw new w(-950, !1)
		return n.value
	}
	return (r[Fe] = n), r
}
function ro(e) {
	return { toString: e }.toString()
}
var Qs = '__parameters__'
function $C(e) {
	return function (...n) {
		if (e) {
			let r = e(...n)
			for (let i in r) this[i] = r[i]
		}
	}
}
function kv(e, t, n) {
	return ro(() => {
		let r = $C(t)
		function i(...o) {
			if (this instanceof i) return r.apply(this, o), this
			let s = new i(...o)
			return (a.annotation = s), a
			function a(c, u, l) {
				let d = c.hasOwnProperty(Qs)
					? c[Qs]
					: Object.defineProperty(c, Qs, { value: [] })[Qs]
				for (; d.length <= l; ) d.push(null)
				return (d[l] = d[l] || []).push(s), c
			}
		}
		return (i.prototype.ngMetadataName = e), (i.annotationCls = i), i
	})
}
var _t = globalThis
function K(e) {
	for (let t in e) if (e[t] === K) return t
	throw Error('Could not find renamed property on target object.')
}
function HC(e, t) {
	for (let n in t) t.hasOwnProperty(n) && !e.hasOwnProperty(n) && (e[n] = t[n])
}
function Oe(e) {
	if (typeof e == 'string') return e
	if (Array.isArray(e)) return `[${e.map(Oe).join(', ')}]`
	if (e == null) return '' + e
	let t = e.overriddenName || e.name
	if (t) return `${t}`
	let n = e.toString()
	if (n == null) return '' + n
	let r = n.indexOf(`
`)
	return r >= 0 ? n.slice(0, r) : n
}
function Om(e, t) {
	return e ? (t ? `${e} ${t}` : e) : t || ''
}
var zC = K({ __forward_ref__: K })
function Zr(e) {
	return (
		(e.__forward_ref__ = Zr),
		(e.toString = function () {
			return Oe(this())
		}),
		e
	)
}
function De(e) {
	return xv(e) ? e() : e
}
function xv(e) {
	return (
		typeof e == 'function' && e.hasOwnProperty(zC) && e.__forward_ref__ === Zr
	)
}
function _(e) {
	return {
		token: e.token,
		providedIn: e.providedIn || null,
		factory: e.factory,
		value: void 0,
	}
}
function ot(e) {
	return { providers: e.providers || [], imports: e.imports || [] }
}
function La(e) {
	return km(e, Fv) || km(e, Lv)
}
function Pv(e) {
	return La(e) !== null
}
function km(e, t) {
	return e.hasOwnProperty(t) ? e[t] : null
}
function WC(e) {
	let t = e && (e[Fv] || e[Lv])
	return t || null
}
function xm(e) {
	return e && (e.hasOwnProperty(Pm) || e.hasOwnProperty(GC)) ? e[Pm] : null
}
var Fv = K({ ɵprov: K }),
	Pm = K({ ɵinj: K }),
	Lv = K({ ngInjectableDef: K }),
	GC = K({ ngInjectorDef: K }),
	E = class {
		_desc
		ngMetadataName = 'InjectionToken'
		ɵprov
		constructor(t, n) {
			;(this._desc = t),
				(this.ɵprov = void 0),
				typeof n == 'number'
					? (this.__NG_ELEMENT_ID__ = n)
					: n !== void 0 &&
					  (this.ɵprov = _({
							token: this,
							providedIn: n.providedIn || 'root',
							factory: n.factory,
					  }))
		}
		get multi() {
			return this
		}
		toString() {
			return `InjectionToken ${this._desc}`
		}
	}
function Vv(e) {
	return e && !!e.ɵproviders
}
var qC = K({ ɵcmp: K }),
	KC = K({ ɵdir: K }),
	YC = K({ ɵpipe: K }),
	ZC = K({ ɵmod: K }),
	la = K({ ɵfac: K }),
	Zi = K({ __NG_ELEMENT_ID__: K }),
	Fm = K({ __NG_ENV_ID__: K })
function Va(e) {
	return typeof e == 'string' ? e : e == null ? '' : String(e)
}
function QC(e) {
	return typeof e == 'function'
		? e.name || e.toString()
		: typeof e == 'object' && e != null && typeof e.type == 'function'
		? e.type.name || e.type.toString()
		: Va(e)
}
function jv(e, t) {
	throw new w(-200, e)
}
function Bd(e, t) {
	throw new w(-201, !1)
}
var F = (function (e) {
		return (
			(e[(e.Default = 0)] = 'Default'),
			(e[(e.Host = 1)] = 'Host'),
			(e[(e.Self = 2)] = 'Self'),
			(e[(e.SkipSelf = 4)] = 'SkipSelf'),
			(e[(e.Optional = 8)] = 'Optional'),
			e
		)
	})(F || {}),
	Gl
function Uv() {
	return Gl
}
function Ne(e) {
	let t = Gl
	return (Gl = e), t
}
function Bv(e, t, n) {
	let r = La(e)
	if (r && r.providedIn == 'root')
		return r.value === void 0 ? (r.value = r.factory()) : r.value
	if (n & F.Optional) return null
	if (t !== void 0) return t
	Bd(e, 'Injector')
}
var JC = {},
	Gn = JC,
	ql = '__NG_DI_FLAG__',
	da = class {
		injector
		constructor(t) {
			this.injector = t
		}
		retrieve(t, n) {
			let r = n
			return this.injector.get(t, r.optional ? el : Gn, r)
		}
	},
	fa = 'ngTempTokenPath',
	XC = 'ngTokenPath',
	eT = /\n/gm,
	tT = '\u0275',
	Lm = '__source'
function nT(e, t = F.Default) {
	if (Hi() === void 0) throw new w(-203, !1)
	if (Hi() === null) return Bv(e, void 0, t)
	{
		let n = Hi(),
			r
		return (
			n instanceof da ? (r = n.injector) : (r = n),
			r.get(e, t & F.Optional ? null : void 0, t)
		)
	}
}
function I(e, t = F.Default) {
	return (Uv() || nT)(De(e), t)
}
function g(e, t = F.Default) {
	return I(e, ja(t))
}
function ja(e) {
	return typeof e > 'u' || typeof e == 'number'
		? e
		: 0 | (e.optional && 8) | (e.host && 1) | (e.self && 2) | (e.skipSelf && 4)
}
function Kl(e) {
	let t = []
	for (let n = 0; n < e.length; n++) {
		let r = De(e[n])
		if (Array.isArray(r)) {
			if (r.length === 0) throw new w(900, !1)
			let i,
				o = F.Default
			for (let s = 0; s < r.length; s++) {
				let a = r[s],
					c = rT(a)
				typeof c == 'number' ? (c === -1 ? (i = a.token) : (o |= c)) : (i = a)
			}
			t.push(I(i, o))
		} else t.push(I(r))
	}
	return t
}
function $v(e, t) {
	return (e[ql] = t), (e.prototype[ql] = t), e
}
function rT(e) {
	return e[ql]
}
function iT(e, t, n, r) {
	let i = e[fa]
	throw (
		(t[Lm] && i.unshift(t[Lm]),
		(e.message = oT(
			`
` + e.message,
			i,
			n,
			r
		)),
		(e[XC] = i),
		(e[fa] = null),
		e)
	)
}
function oT(e, t, n, r = null) {
	e =
		e &&
		e.charAt(0) ===
			`
` &&
		e.charAt(1) == tT
			? e.slice(2)
			: e
	let i = Oe(t)
	if (Array.isArray(t)) i = t.map(Oe).join(' -> ')
	else if (typeof t == 'object') {
		let o = []
		for (let s in t)
			if (t.hasOwnProperty(s)) {
				let a = t[s]
				o.push(s + ':' + (typeof a == 'string' ? JSON.stringify(a) : Oe(a)))
			}
		i = `{${o.join(', ')}}`
	}
	return `${n}${r ? '(' + r + ')' : ''}[${i}]: ${e.replace(
		eT,
		`
  `
	)}`
}
var Zt = $v(kv('Optional'), 8)
var sT = $v(kv('SkipSelf'), 4)
function Kn(e, t) {
	let n = e.hasOwnProperty(la)
	return n ? e[la] : null
}
function aT(e, t, n) {
	if (e.length !== t.length) return !1
	for (let r = 0; r < e.length; r++) {
		let i = e[r],
			o = t[r]
		if ((n && ((i = n(i)), (o = n(o))), o !== i)) return !1
	}
	return !0
}
function cT(e) {
	return e.flat(Number.POSITIVE_INFINITY)
}
function $d(e, t) {
	e.forEach((n) => (Array.isArray(n) ? $d(n, t) : t(n)))
}
function Hv(e, t, n) {
	t >= e.length ? e.push(n) : e.splice(t, 0, n)
}
function ha(e, t) {
	return t >= e.length - 1 ? e.pop() : e.splice(t, 1)[0]
}
function uT(e, t, n, r) {
	let i = e.length
	if (i == t) e.push(n, r)
	else if (i === 1) e.push(r, e[0]), (e[0] = n)
	else {
		for (i--, e.push(e[i - 1], e[i]); i > t; ) {
			let o = i - 2
			;(e[i] = e[o]), i--
		}
		;(e[t] = n), (e[t + 1] = r)
	}
}
function lT(e, t, n) {
	let r = io(e, t)
	return r >= 0 ? (e[r | 1] = n) : ((r = ~r), uT(e, r, t, n)), r
}
function Rl(e, t) {
	let n = io(e, t)
	if (n >= 0) return e[n | 1]
}
function io(e, t) {
	return dT(e, t, 1)
}
function dT(e, t, n) {
	let r = 0,
		i = e.length >> n
	for (; i !== r; ) {
		let o = r + ((i - r) >> 1),
			s = e[o << n]
		if (t === s) return o << n
		s > t ? (i = o) : (r = o + 1)
	}
	return ~(i << n)
}
var Yn = {},
	ze = [],
	vn = new E(''),
	zv = new E('', -1),
	Wv = new E(''),
	pa = class {
		get(t, n = Gn) {
			if (n === Gn) {
				let r = new Error(`NullInjectorError: No provider for ${Oe(t)}!`)
				throw ((r.name = 'NullInjectorError'), r)
			}
			return n
		}
	}
function Gv(e, t) {
	let n = e[ZC] || null
	if (!n && t === !0)
		throw new Error(`Type ${Oe(e)} does not have '\u0275mod' property.`)
	return n
}
function yn(e) {
	return e[qC] || null
}
function qv(e) {
	return e[KC] || null
}
function Kv(e) {
	return e[YC] || null
}
function qe(e) {
	return { ɵproviders: e }
}
function Hd(...e) {
	return { ɵproviders: zd(!0, e), ɵfromNgModule: !0 }
}
function zd(e, ...t) {
	let n = [],
		r = new Set(),
		i,
		o = (s) => {
			n.push(s)
		}
	return (
		$d(t, (s) => {
			let a = s
			Yl(a, o, [], r) && ((i ||= []), i.push(a))
		}),
		i !== void 0 && Yv(i, o),
		n
	)
}
function Yv(e, t) {
	for (let n = 0; n < e.length; n++) {
		let { ngModule: r, providers: i } = e[n]
		Wd(i, (o) => {
			t(o, r)
		})
	}
}
function Yl(e, t, n, r) {
	if (((e = De(e)), !e)) return !1
	let i = null,
		o = xm(e),
		s = !o && yn(e)
	if (!o && !s) {
		let c = e.ngModule
		if (((o = xm(c)), o)) i = c
		else return !1
	} else {
		if (s && !s.standalone) return !1
		i = e
	}
	let a = r.has(i)
	if (s) {
		if (a) return !1
		if ((r.add(i), s.dependencies)) {
			let c =
				typeof s.dependencies == 'function' ? s.dependencies() : s.dependencies
			for (let u of c) Yl(u, t, n, r)
		}
	} else if (o) {
		if (o.imports != null && !a) {
			r.add(i)
			let u
			try {
				$d(o.imports, (l) => {
					Yl(l, t, n, r) && ((u ||= []), u.push(l))
				})
			} finally {
			}
			u !== void 0 && Yv(u, t)
		}
		if (!a) {
			let u = Kn(i) || (() => new i())
			t({ provide: i, useFactory: u, deps: ze }, i),
				t({ provide: Wv, useValue: i, multi: !0 }, i),
				t({ provide: vn, useValue: () => I(i), multi: !0 }, i)
		}
		let c = o.providers
		if (c != null && !a) {
			let u = e
			Wd(c, (l) => {
				t(l, u)
			})
		}
	} else return !1
	return i !== e && e.providers !== void 0
}
function Wd(e, t) {
	for (let n of e)
		Vv(n) && (n = n.ɵproviders), Array.isArray(n) ? Wd(n, t) : t(n)
}
var fT = K({ provide: String, useValue: K })
function Zv(e) {
	return e !== null && typeof e == 'object' && fT in e
}
function hT(e) {
	return !!(e && e.useExisting)
}
function pT(e) {
	return !!(e && e.useFactory)
}
function Hr(e) {
	return typeof e == 'function'
}
function gT(e) {
	return !!e.useClass
}
var Ua = new E(''),
	na = {},
	Vm = {},
	Nl
function Gd() {
	return Nl === void 0 && (Nl = new pa()), Nl
}
var fe = class {},
	Qi = class extends fe {
		parent
		source
		scopes
		records = new Map()
		_ngOnDestroyHooks = new Set()
		_onDestroyHooks = []
		get destroyed() {
			return this._destroyed
		}
		_destroyed = !1
		injectorDefTypes
		constructor(t, n, r, i) {
			super(),
				(this.parent = n),
				(this.source = r),
				(this.scopes = i),
				Ql(t, (s) => this.processProvider(s)),
				this.records.set(zv, xr(void 0, this)),
				i.has('environment') && this.records.set(fe, xr(void 0, this))
			let o = this.records.get(Ua)
			o != null && typeof o.value == 'string' && this.scopes.add(o.value),
				(this.injectorDefTypes = new Set(this.get(Wv, ze, F.Self)))
		}
		retrieve(t, n) {
			let r = n
			return this.get(t, r.optional ? el : Gn, r)
		}
		destroy() {
			Ki(this), (this._destroyed = !0)
			let t = U(null)
			try {
				for (let r of this._ngOnDestroyHooks) r.ngOnDestroy()
				let n = this._onDestroyHooks
				this._onDestroyHooks = []
				for (let r of n) r()
			} finally {
				this.records.clear(),
					this._ngOnDestroyHooks.clear(),
					this.injectorDefTypes.clear(),
					U(t)
			}
		}
		onDestroy(t) {
			return (
				Ki(this), this._onDestroyHooks.push(t), () => this.removeOnDestroy(t)
			)
		}
		runInContext(t) {
			Ki(this)
			let n = jt(this),
				r = Ne(void 0),
				i
			try {
				return t()
			} finally {
				jt(n), Ne(r)
			}
		}
		get(t, n = Gn, r = F.Default) {
			if ((Ki(this), t.hasOwnProperty(Fm))) return t[Fm](this)
			r = ja(r)
			let i,
				o = jt(this),
				s = Ne(void 0)
			try {
				if (!(r & F.SkipSelf)) {
					let c = this.records.get(t)
					if (c === void 0) {
						let u = _T(t) && La(t)
						u && this.injectableDefInScope(u)
							? (c = xr(Zl(t), na))
							: (c = null),
							this.records.set(t, c)
					}
					if (c != null) return this.hydrate(t, c)
				}
				let a = r & F.Self ? Gd() : this.parent
				return (n = r & F.Optional && n === Gn ? null : n), a.get(t, n)
			} catch (a) {
				if (a.name === 'NullInjectorError') {
					if (((a[fa] = a[fa] || []).unshift(Oe(t)), o)) throw a
					return iT(a, t, 'R3InjectorError', this.source)
				} else throw a
			} finally {
				Ne(s), jt(o)
			}
		}
		resolveInjectorInitializers() {
			let t = U(null),
				n = jt(this),
				r = Ne(void 0),
				i
			try {
				let o = this.get(vn, ze, F.Self)
				for (let s of o) s()
			} finally {
				jt(n), Ne(r), U(t)
			}
		}
		toString() {
			let t = [],
				n = this.records
			for (let r of n.keys()) t.push(Oe(r))
			return `R3Injector[${t.join(', ')}]`
		}
		processProvider(t) {
			t = De(t)
			let n = Hr(t) ? t : De(t && t.provide),
				r = vT(t)
			if (!Hr(t) && t.multi === !0) {
				let i = this.records.get(n)
				i ||
					((i = xr(void 0, na, !0)),
					(i.factory = () => Kl(i.multi)),
					this.records.set(n, i)),
					(n = t),
					i.multi.push(t)
			}
			this.records.set(n, r)
		}
		hydrate(t, n) {
			let r = U(null)
			try {
				return (
					n.value === Vm
						? jv(Oe(t))
						: n.value === na && ((n.value = Vm), (n.value = n.factory())),
					typeof n.value == 'object' &&
						n.value &&
						ET(n.value) &&
						this._ngOnDestroyHooks.add(n.value),
					n.value
				)
			} finally {
				U(r)
			}
		}
		injectableDefInScope(t) {
			if (!t.providedIn) return !1
			let n = De(t.providedIn)
			return typeof n == 'string'
				? n === 'any' || this.scopes.has(n)
				: this.injectorDefTypes.has(n)
		}
		removeOnDestroy(t) {
			let n = this._onDestroyHooks.indexOf(t)
			n !== -1 && this._onDestroyHooks.splice(n, 1)
		}
	}
function Zl(e) {
	let t = La(e),
		n = t !== null ? t.factory : Kn(e)
	if (n !== null) return n
	if (e instanceof E) throw new w(204, !1)
	if (e instanceof Function) return mT(e)
	throw new w(204, !1)
}
function mT(e) {
	if (e.length > 0) throw new w(204, !1)
	let n = WC(e)
	return n !== null ? () => n.factory(e) : () => new e()
}
function vT(e) {
	if (Zv(e)) return xr(void 0, e.useValue)
	{
		let t = Qv(e)
		return xr(t, na)
	}
}
function Qv(e, t, n) {
	let r
	if (Hr(e)) {
		let i = De(e)
		return Kn(i) || Zl(i)
	} else if (Zv(e)) r = () => De(e.useValue)
	else if (pT(e)) r = () => e.useFactory(...Kl(e.deps || []))
	else if (hT(e)) r = () => I(De(e.useExisting))
	else {
		let i = De(e && (e.useClass || e.provide))
		if (yT(e)) r = () => new i(...Kl(e.deps))
		else return Kn(i) || Zl(i)
	}
	return r
}
function Ki(e) {
	if (e.destroyed) throw new w(205, !1)
}
function xr(e, t, n = !1) {
	return { factory: e, value: t, multi: n ? [] : void 0 }
}
function yT(e) {
	return !!e.deps
}
function ET(e) {
	return (
		e !== null && typeof e == 'object' && typeof e.ngOnDestroy == 'function'
	)
}
function _T(e) {
	return typeof e == 'function' || (typeof e == 'object' && e instanceof E)
}
function Ql(e, t) {
	for (let n of e)
		Array.isArray(n) ? Ql(n, t) : n && Vv(n) ? Ql(n.ɵproviders, t) : t(n)
}
function he(e, t) {
	let n
	e instanceof Qi ? (Ki(e), (n = e)) : (n = new da(e))
	let r,
		i = jt(n),
		o = Ne(void 0)
	try {
		return t()
	} finally {
		jt(i), Ne(o)
	}
}
function Jv() {
	return Uv() !== void 0 || Hi() != null
}
function Ba(e) {
	if (!Jv()) throw new w(-203, !1)
}
function IT(e) {
	return typeof e == 'function'
}
var je = 0,
	S = 1,
	R = 2,
	de = 3,
	nt = 4,
	st = 5,
	It = 6,
	ga = 7,
	xe = 8,
	En = 9,
	Ht = 10,
	Q = 11,
	Ji = 12,
	jm = 13,
	Qr = 14,
	Ge = 15,
	Zn = 16,
	Pr = 17,
	zt = 18,
	$a = 19,
	Xv = 20,
	mn = 21,
	Ol = 22,
	ma = 23,
	We = 24,
	jr = 25,
	te = 26,
	ey = 1,
	Wt = 6,
	Gt = 7,
	va = 8,
	zr = 9,
	ke = 10
function rt(e) {
	return Array.isArray(e) && typeof e[ey] == 'object'
}
function Ct(e) {
	return Array.isArray(e) && e[ey] === !0
}
function qd(e) {
	return (e.flags & 4) !== 0
}
function ir(e) {
	return e.componentOffset > -1
}
function Ha(e) {
	return (e.flags & 1) === 1
}
function wt(e) {
	return !!e.template
}
function Xi(e) {
	return (e[R] & 512) !== 0
}
function Jr(e) {
	return (e[R] & 256) === 256
}
var Jl = class {
	previousValue
	currentValue
	firstChange
	constructor(t, n, r) {
		;(this.previousValue = t), (this.currentValue = n), (this.firstChange = r)
	}
	isFirstChange() {
		return this.firstChange
	}
}
function ty(e, t, n, r) {
	t !== null ? t.applyValueToInputSignal(t, r) : (e[n] = r)
}
var or = (() => {
	let e = () => ny
	return (e.ngInherit = !0), e
})()
function ny(e) {
	return e.type.prototype.ngOnChanges && (e.setInput = DT), wT
}
function wT() {
	let e = iy(this),
		t = e?.current
	if (t) {
		let n = e.previous
		if (n === Yn) e.previous = t
		else for (let r in t) n[r] = t[r]
		;(e.current = null), this.ngOnChanges(t)
	}
}
function DT(e, t, n, r, i) {
	let o = this.declaredInputs[r],
		s = iy(e) || bT(e, { previous: Yn, current: null }),
		a = s.current || (s.current = {}),
		c = s.previous,
		u = c[o]
	;(a[o] = new Jl(u && u.currentValue, n, c === Yn)), ty(e, t, i, n)
}
var ry = '__ngSimpleChanges__'
function iy(e) {
	return e[ry] || null
}
function bT(e, t) {
	return (e[ry] = t)
}
var Um = null
var G = function (e, t = null, n) {
		Um?.(e, t, n)
	},
	oy = 'svg',
	CT = 'math'
function it(e) {
	for (; Array.isArray(e); ) e = e[je]
	return e
}
function sy(e, t) {
	return it(t[e])
}
function at(e, t) {
	return it(t[e.index])
}
function za(e, t) {
	return e.data[t]
}
function ay(e, t) {
	return e[t]
}
function Dt(e, t) {
	let n = t[e]
	return rt(n) ? n : n[je]
}
function TT(e) {
	return (e[R] & 4) === 4
}
function Kd(e) {
	return (e[R] & 128) === 128
}
function ST(e) {
	return Ct(e[de])
}
function Wr(e, t) {
	return t == null ? null : e[t]
}
function cy(e) {
	e[Pr] = 0
}
function uy(e) {
	e[R] & 1024 || ((e[R] |= 1024), Kd(e) && oo(e))
}
function AT(e, t) {
	for (; e > 0; ) (t = t[Qr]), e--
	return t
}
function Wa(e) {
	return !!(e[R] & 9216 || e[We]?.dirty)
}
function Xl(e) {
	e[Ht].changeDetectionScheduler?.notify(8),
		e[R] & 64 && (e[R] |= 1024),
		Wa(e) && oo(e)
}
function oo(e) {
	e[Ht].changeDetectionScheduler?.notify(0)
	let t = Qn(e)
	for (; t !== null && !(t[R] & 8192 || ((t[R] |= 8192), !Kd(t))); ) t = Qn(t)
}
function ly(e, t) {
	if (Jr(e)) throw new w(911, !1)
	e[mn] === null && (e[mn] = []), e[mn].push(t)
}
function MT(e, t) {
	if (e[mn] === null) return
	let n = e[mn].indexOf(t)
	n !== -1 && e[mn].splice(n, 1)
}
function Qn(e) {
	let t = e[de]
	return Ct(t) ? t[de] : t
}
function dy(e) {
	return (e[ga] ??= [])
}
function fy(e) {
	return (e.cleanup ??= [])
}
function RT(e, t, n, r) {
	let i = dy(t)
	i.push(n), e.firstCreatePass && fy(e).push(r, i.length - 1)
}
var O = { lFrame: Ey(null), bindingsEnabled: !0, skipHydrationRootTNode: null }
var ed = !1
function NT() {
	return O.lFrame.elementDepthCount
}
function OT() {
	O.lFrame.elementDepthCount++
}
function kT() {
	O.lFrame.elementDepthCount--
}
function Yd() {
	return O.bindingsEnabled
}
function so() {
	return O.skipHydrationRootTNode !== null
}
function xT(e) {
	return O.skipHydrationRootTNode === e
}
function PT(e) {
	O.skipHydrationRootTNode = e
}
function FT() {
	O.skipHydrationRootTNode = null
}
function z() {
	return O.lFrame.lView
}
function pe() {
	return O.lFrame.tView
}
function Xr(e) {
	return (O.lFrame.contextLView = e), e[xe]
}
function ei(e) {
	return (O.lFrame.contextLView = null), e
}
function be() {
	let e = hy()
	for (; e !== null && e.type === 64; ) e = e.parent
	return e
}
function hy() {
	return O.lFrame.currentTNode
}
function LT() {
	let e = O.lFrame,
		t = e.currentTNode
	return e.isParent ? t : t.parent
}
function sr(e, t) {
	let n = O.lFrame
	;(n.currentTNode = e), (n.isParent = t)
}
function Zd() {
	return O.lFrame.isParent
}
function py() {
	O.lFrame.isParent = !1
}
function VT() {
	return O.lFrame.contextLView
}
function gy() {
	return ed
}
function Bm(e) {
	let t = ed
	return (ed = e), t
}
function jT() {
	let e = O.lFrame,
		t = e.bindingRootIndex
	return t === -1 && (t = e.bindingRootIndex = e.tView.bindingStartIndex), t
}
function UT(e) {
	return (O.lFrame.bindingIndex = e)
}
function Ga() {
	return O.lFrame.bindingIndex++
}
function BT(e) {
	let t = O.lFrame,
		n = t.bindingIndex
	return (t.bindingIndex = t.bindingIndex + e), n
}
function $T() {
	return O.lFrame.inI18n
}
function HT(e, t) {
	let n = O.lFrame
	;(n.bindingIndex = n.bindingRootIndex = e), td(t)
}
function zT() {
	return O.lFrame.currentDirectiveIndex
}
function td(e) {
	O.lFrame.currentDirectiveIndex = e
}
function WT(e) {
	let t = O.lFrame.currentDirectiveIndex
	return t === -1 ? null : e[t]
}
function my() {
	return O.lFrame.currentQueryIndex
}
function Qd(e) {
	O.lFrame.currentQueryIndex = e
}
function GT(e) {
	let t = e[S]
	return t.type === 2 ? t.declTNode : t.type === 1 ? e[st] : null
}
function vy(e, t, n) {
	if (n & F.SkipSelf) {
		let i = t,
			o = e
		for (; (i = i.parent), i === null && !(n & F.Host); )
			if (((i = GT(o)), i === null || ((o = o[Qr]), i.type & 10))) break
		if (i === null) return !1
		;(t = i), (e = o)
	}
	let r = (O.lFrame = yy())
	return (r.currentTNode = t), (r.lView = e), !0
}
function Jd(e) {
	let t = yy(),
		n = e[S]
	;(O.lFrame = t),
		(t.currentTNode = n.firstChild),
		(t.lView = e),
		(t.tView = n),
		(t.contextLView = e),
		(t.bindingIndex = n.bindingStartIndex),
		(t.inI18n = !1)
}
function yy() {
	let e = O.lFrame,
		t = e === null ? null : e.child
	return t === null ? Ey(e) : t
}
function Ey(e) {
	let t = {
		currentTNode: null,
		isParent: !0,
		lView: null,
		tView: null,
		selectedIndex: -1,
		contextLView: null,
		elementDepthCount: 0,
		currentNamespace: null,
		currentDirectiveIndex: -1,
		bindingRootIndex: -1,
		bindingIndex: -1,
		currentQueryIndex: 0,
		parent: e,
		child: null,
		inI18n: !1,
	}
	return e !== null && (e.child = t), t
}
function _y() {
	let e = O.lFrame
	return (O.lFrame = e.parent), (e.currentTNode = null), (e.lView = null), e
}
var Iy = _y
function Xd() {
	let e = _y()
	;(e.isParent = !0),
		(e.tView = null),
		(e.selectedIndex = -1),
		(e.contextLView = null),
		(e.elementDepthCount = 0),
		(e.currentDirectiveIndex = -1),
		(e.currentNamespace = null),
		(e.bindingRootIndex = -1),
		(e.bindingIndex = -1),
		(e.currentQueryIndex = 0)
}
function qT(e) {
	return (O.lFrame.contextLView = AT(e, O.lFrame.contextLView))[xe]
}
function ti() {
	return O.lFrame.selectedIndex
}
function Jn(e) {
	O.lFrame.selectedIndex = e
}
function ef() {
	let e = O.lFrame
	return za(e.tView, e.selectedIndex)
}
function ao() {
	O.lFrame.currentNamespace = oy
}
function wy() {
	KT()
}
function KT() {
	O.lFrame.currentNamespace = null
}
function Dy() {
	return O.lFrame.currentNamespace
}
var by = !0
function qa() {
	return by
}
function In(e) {
	by = e
}
function YT(e, t, n) {
	let { ngOnChanges: r, ngOnInit: i, ngDoCheck: o } = t.type.prototype
	if (r) {
		let s = ny(t)
		;(n.preOrderHooks ??= []).push(e, s),
			(n.preOrderCheckHooks ??= []).push(e, s)
	}
	i && (n.preOrderHooks ??= []).push(0 - e, i),
		o &&
			((n.preOrderHooks ??= []).push(e, o),
			(n.preOrderCheckHooks ??= []).push(e, o))
}
function tf(e, t) {
	for (let n = t.directiveStart, r = t.directiveEnd; n < r; n++) {
		let o = e.data[n].type.prototype,
			{
				ngAfterContentInit: s,
				ngAfterContentChecked: a,
				ngAfterViewInit: c,
				ngAfterViewChecked: u,
				ngOnDestroy: l,
			} = o
		s && (e.contentHooks ??= []).push(-n, s),
			a &&
				((e.contentHooks ??= []).push(n, a),
				(e.contentCheckHooks ??= []).push(n, a)),
			c && (e.viewHooks ??= []).push(-n, c),
			u &&
				((e.viewHooks ??= []).push(n, u), (e.viewCheckHooks ??= []).push(n, u)),
			l != null && (e.destroyHooks ??= []).push(n, l)
	}
}
function ra(e, t, n) {
	Cy(e, t, 3, n)
}
function ia(e, t, n, r) {
	;(e[R] & 3) === n && Cy(e, t, n, r)
}
function kl(e, t) {
	let n = e[R]
	;(n & 3) === t && ((n &= 16383), (n += 1), (e[R] = n))
}
function Cy(e, t, n, r) {
	let i = r !== void 0 ? e[Pr] & 65535 : 0,
		o = r ?? -1,
		s = t.length - 1,
		a = 0
	for (let c = i; c < s; c++)
		if (typeof t[c + 1] == 'number') {
			if (((a = t[c]), r != null && a >= r)) break
		} else
			t[c] < 0 && (e[Pr] += 65536),
				(a < o || o == -1) &&
					(ZT(e, n, t, c), (e[Pr] = (e[Pr] & 4294901760) + c + 2)),
				c++
}
function $m(e, t) {
	G(4, e, t)
	let n = U(null)
	try {
		t.call(e)
	} finally {
		U(n), G(5, e, t)
	}
}
function ZT(e, t, n, r) {
	let i = n[r] < 0,
		o = n[r + 1],
		s = i ? -n[r] : n[r],
		a = e[s]
	i
		? e[R] >> 14 < e[Pr] >> 16 &&
		  (e[R] & 3) === t &&
		  ((e[R] += 16384), $m(a, o))
		: $m(a, o)
}
var Ur = -1,
	Xn = class {
		factory
		injectImpl
		resolving = !1
		canSeeViewProviders
		multi
		componentProviders
		index
		providerFactory
		constructor(t, n, r) {
			;(this.factory = t), (this.canSeeViewProviders = n), (this.injectImpl = r)
		}
	}
function QT(e) {
	return (e.flags & 8) !== 0
}
function JT(e) {
	return (e.flags & 16) !== 0
}
function XT(e, t, n) {
	let r = 0
	for (; r < n.length; ) {
		let i = n[r]
		if (typeof i == 'number') {
			if (i !== 0) break
			r++
			let o = n[r++],
				s = n[r++],
				a = n[r++]
			e.setAttribute(t, s, a, o)
		} else {
			let o = i,
				s = n[++r]
			eS(o) ? e.setProperty(t, o, s) : e.setAttribute(t, o, s), r++
		}
	}
	return r
}
function Ty(e) {
	return e === 3 || e === 4 || e === 6
}
function eS(e) {
	return e.charCodeAt(0) === 64
}
function Gr(e, t) {
	if (!(t === null || t.length === 0))
		if (e === null || e.length === 0) e = t.slice()
		else {
			let n = -1
			for (let r = 0; r < t.length; r++) {
				let i = t[r]
				typeof i == 'number'
					? (n = i)
					: n === 0 ||
					  (n === -1 || n === 2
							? Hm(e, n, i, null, t[++r])
							: Hm(e, n, i, null, null))
			}
		}
	return e
}
function Hm(e, t, n, r, i) {
	let o = 0,
		s = e.length
	if (t === -1) s = -1
	else
		for (; o < e.length; ) {
			let a = e[o++]
			if (typeof a == 'number') {
				if (a === t) {
					s = -1
					break
				} else if (a > t) {
					s = o - 1
					break
				}
			}
		}
	for (; o < e.length; ) {
		let a = e[o]
		if (typeof a == 'number') break
		if (a === n) {
			i !== null && (e[o + 1] = i)
			return
		}
		o++, i !== null && o++
	}
	s !== -1 && (e.splice(s, 0, t), (o = s + 1)),
		e.splice(o++, 0, n),
		i !== null && e.splice(o++, 0, i)
}
var xl = {},
	Br = class {
		injector
		parentInjector
		constructor(t, n) {
			;(this.injector = t), (this.parentInjector = n)
		}
		get(t, n, r) {
			r = ja(r)
			let i = this.injector.get(t, xl, r)
			return i !== xl || n === xl ? i : this.parentInjector.get(t, n, r)
		}
	}
function Sy(e) {
	return e !== Ur
}
function ya(e) {
	return e & 32767
}
function tS(e) {
	return e >> 16
}
function Ea(e, t) {
	let n = tS(e),
		r = t
	for (; n > 0; ) (r = r[Qr]), n--
	return r
}
var nd = !0
function _a(e) {
	let t = nd
	return (nd = e), t
}
var nS = 256,
	Ay = nS - 1,
	My = 5,
	rS = 0,
	Et = {}
function iS(e, t, n) {
	let r
	typeof n == 'string'
		? (r = n.charCodeAt(0) || 0)
		: n.hasOwnProperty(Zi) && (r = n[Zi]),
		r == null && (r = n[Zi] = rS++)
	let i = r & Ay,
		o = 1 << i
	t.data[e + (i >> My)] |= o
}
function Ia(e, t) {
	let n = Ry(e, t)
	if (n !== -1) return n
	let r = t[S]
	r.firstCreatePass &&
		((e.injectorIndex = t.length),
		Pl(r.data, e),
		Pl(t, null),
		Pl(r.blueprint, null))
	let i = nf(e, t),
		o = e.injectorIndex
	if (Sy(i)) {
		let s = ya(i),
			a = Ea(i, t),
			c = a[S].data
		for (let u = 0; u < 8; u++) t[o + u] = a[s + u] | c[s + u]
	}
	return (t[o + 8] = i), o
}
function Pl(e, t) {
	e.push(0, 0, 0, 0, 0, 0, 0, 0, t)
}
function Ry(e, t) {
	return e.injectorIndex === -1 ||
		(e.parent && e.parent.injectorIndex === e.injectorIndex) ||
		t[e.injectorIndex + 8] === null
		? -1
		: e.injectorIndex
}
function nf(e, t) {
	if (e.parent && e.parent.injectorIndex !== -1) return e.parent.injectorIndex
	let n = 0,
		r = null,
		i = t
	for (; i !== null; ) {
		if (((r = Py(i)), r === null)) return Ur
		if ((n++, (i = i[Qr]), r.injectorIndex !== -1))
			return r.injectorIndex | (n << 16)
	}
	return Ur
}
function rd(e, t, n) {
	iS(e, t, n)
}
function oS(e, t) {
	if (t === 'class') return e.classes
	if (t === 'style') return e.styles
	let n = e.attrs
	if (n) {
		let r = n.length,
			i = 0
		for (; i < r; ) {
			let o = n[i]
			if (Ty(o)) break
			if (o === 0) i = i + 2
			else if (typeof o == 'number')
				for (i++; i < r && typeof n[i] == 'string'; ) i++
			else {
				if (o === t) return n[i + 1]
				i = i + 2
			}
		}
	}
	return null
}
function Ny(e, t, n) {
	if (n & F.Optional || e !== void 0) return e
	Bd(t, 'NodeInjector')
}
function Oy(e, t, n, r) {
	if (
		(n & F.Optional && r === void 0 && (r = null),
		(n & (F.Self | F.Host)) === 0)
	) {
		let i = e[En],
			o = Ne(void 0)
		try {
			return i ? i.get(t, r, n & F.Optional) : Bv(t, r, n & F.Optional)
		} finally {
			Ne(o)
		}
	}
	return Ny(r, t, n)
}
function ky(e, t, n, r = F.Default, i) {
	if (e !== null) {
		if (t[R] & 2048 && !(r & F.Self)) {
			let s = uS(e, t, n, r, Et)
			if (s !== Et) return s
		}
		let o = xy(e, t, n, r, Et)
		if (o !== Et) return o
	}
	return Oy(t, n, r, i)
}
function xy(e, t, n, r, i) {
	let o = aS(n)
	if (typeof o == 'function') {
		if (!vy(t, e, r)) return r & F.Host ? Ny(i, n, r) : Oy(t, n, r, i)
		try {
			let s
			if (((s = o(r)), s == null && !(r & F.Optional))) Bd(n)
			else return s
		} finally {
			Iy()
		}
	} else if (typeof o == 'number') {
		let s = null,
			a = Ry(e, t),
			c = Ur,
			u = r & F.Host ? t[Ge][st] : null
		for (
			(a === -1 || r & F.SkipSelf) &&
			((c = a === -1 ? nf(e, t) : t[a + 8]),
			c === Ur || !Wm(r, !1)
				? (a = -1)
				: ((s = t[S]), (a = ya(c)), (t = Ea(c, t))));
			a !== -1;

		) {
			let l = t[S]
			if (zm(o, a, l.data)) {
				let d = sS(a, t, n, s, r, u)
				if (d !== Et) return d
			}
			;(c = t[a + 8]),
				c !== Ur && Wm(r, t[S].data[a + 8] === u) && zm(o, a, t)
					? ((s = l), (a = ya(c)), (t = Ea(c, t)))
					: (a = -1)
		}
	}
	return i
}
function sS(e, t, n, r, i, o) {
	let s = t[S],
		a = s.data[e + 8],
		c = r == null ? ir(a) && nd : r != s && (a.type & 3) !== 0,
		u = i & F.Host && o === a,
		l = oa(a, s, n, c, u)
	return l !== null ? eo(t, s, l, a) : Et
}
function oa(e, t, n, r, i) {
	let o = e.providerIndexes,
		s = t.data,
		a = o & 1048575,
		c = e.directiveStart,
		u = e.directiveEnd,
		l = o >> 20,
		d = r ? a : a + l,
		h = i ? a + l : u
	for (let f = d; f < h; f++) {
		let m = s[f]
		if ((f < c && n === m) || (f >= c && m.type === n)) return f
	}
	if (i) {
		let f = s[c]
		if (f && wt(f) && f.type === n) return c
	}
	return null
}
function eo(e, t, n, r) {
	let i = e[n],
		o = t.data
	if (i instanceof Xn) {
		let s = i
		s.resolving && jv(QC(o[n]))
		let a = _a(s.canSeeViewProviders)
		s.resolving = !0
		let c,
			u = s.injectImpl ? Ne(s.injectImpl) : null,
			l = vy(e, r, F.Default)
		try {
			;(i = e[n] = s.factory(void 0, o, e, r)),
				t.firstCreatePass && n >= r.directiveStart && YT(n, o[n], t)
		} finally {
			u !== null && Ne(u), _a(a), (s.resolving = !1), Iy()
		}
	}
	return i
}
function aS(e) {
	if (typeof e == 'string') return e.charCodeAt(0) || 0
	let t = e.hasOwnProperty(Zi) ? e[Zi] : void 0
	return typeof t == 'number' ? (t >= 0 ? t & Ay : cS) : t
}
function zm(e, t, n) {
	let r = 1 << e
	return !!(n[t + (e >> My)] & r)
}
function Wm(e, t) {
	return !(e & F.Self) && !(e & F.Host && t)
}
var qn = class {
	_tNode
	_lView
	constructor(t, n) {
		;(this._tNode = t), (this._lView = n)
	}
	get(t, n, r) {
		return ky(this._tNode, this._lView, t, ja(r), n)
	}
}
function cS() {
	return new qn(be(), z())
}
function ni(e) {
	return ro(() => {
		let t = e.prototype.constructor,
			n = t[la] || id(t),
			r = Object.prototype,
			i = Object.getPrototypeOf(e.prototype).constructor
		for (; i && i !== r; ) {
			let o = i[la] || id(i)
			if (o && o !== n) return o
			i = Object.getPrototypeOf(i)
		}
		return (o) => new o()
	})
}
function id(e) {
	return xv(e)
		? () => {
				let t = id(De(e))
				return t && t()
		  }
		: Kn(e)
}
function uS(e, t, n, r, i) {
	let o = e,
		s = t
	for (; o !== null && s !== null && s[R] & 2048 && !Xi(s); ) {
		let a = xy(o, s, n, r | F.Self, Et)
		if (a !== Et) return a
		let c = o.parent
		if (!c) {
			let u = s[Xv]
			if (u) {
				let l = u.get(n, Et, r)
				if (l !== Et) return l
			}
			;(c = Py(s)), (s = s[Qr])
		}
		o = c
	}
	return i
}
function Py(e) {
	let t = e[S],
		n = t.type
	return n === 2 ? t.declTNode : n === 1 ? e[st] : null
}
function rf(e) {
	return oS(be(), e)
}
function Gm(e, t = null, n = null, r) {
	let i = Fy(e, t, n, r)
	return i.resolveInjectorInitializers(), i
}
function Fy(e, t = null, n = null, r, i = new Set()) {
	let o = [n || ze, Hd(e)]
	return (
		(r = r || (typeof e == 'object' ? void 0 : Oe(e))),
		new Qi(o, t || Gd(), r || null, i)
	)
}
var ae = class e {
	static THROW_IF_NOT_FOUND = Gn
	static NULL = new pa()
	static create(t, n) {
		if (Array.isArray(t)) return Gm({ name: '' }, n, t, '')
		{
			let r = t.name ?? ''
			return Gm({ name: r }, t.parent, t.providers, r)
		}
	}
	static ɵprov = _({ token: e, providedIn: 'any', factory: () => I(zv) })
	static __NG_ELEMENT_ID__ = -1
}
var lS = new E('')
lS.__NG_ELEMENT_ID__ = (e) => {
	let t = be()
	if (t === null) throw new w(204, !1)
	if (t.type & 2) return t.value
	if (e & F.Optional) return null
	throw new w(204, !1)
}
var Ly = !1,
	ri = (() => {
		class e {
			static __NG_ELEMENT_ID__ = dS
			static __NG_ENV_ID__ = (n) => n
		}
		return e
	})(),
	od = class extends ri {
		_lView
		constructor(t) {
			super(), (this._lView = t)
		}
		onDestroy(t) {
			return ly(this._lView, t), () => MT(this._lView, t)
		}
	}
function dS() {
	return new od(z())
}
var er = class {},
	Ka = new E('', { providedIn: 'root', factory: () => !1 })
var Vy = new E(''),
	jy = new E(''),
	Ke = (() => {
		class e {
			taskId = 0
			pendingTasks = new Set()
			get _hasPendingTasks() {
				return this.hasPendingTasks.value
			}
			hasPendingTasks = new ee(!1)
			add() {
				this._hasPendingTasks || this.hasPendingTasks.next(!0)
				let n = this.taskId++
				return this.pendingTasks.add(n), n
			}
			has(n) {
				return this.pendingTasks.has(n)
			}
			remove(n) {
				this.pendingTasks.delete(n),
					this.pendingTasks.size === 0 &&
						this._hasPendingTasks &&
						this.hasPendingTasks.next(!1)
			}
			ngOnDestroy() {
				this.pendingTasks.clear(),
					this._hasPendingTasks && this.hasPendingTasks.next(!1)
			}
			static ɵprov = _({ token: e, providedIn: 'root', factory: () => new e() })
		}
		return e
	})(),
	Ya = (() => {
		class e {
			internalPendingTasks = g(Ke)
			scheduler = g(er)
			add() {
				let n = this.internalPendingTasks.add()
				return () => {
					this.internalPendingTasks.has(n) &&
						(this.scheduler.notify(11), this.internalPendingTasks.remove(n))
				}
			}
			run(n) {
				return p(this, null, function* () {
					let r = this.add()
					try {
						return yield n()
					} finally {
						r()
					}
				})
			}
			static ɵprov = _({ token: e, providedIn: 'root', factory: () => new e() })
		}
		return e
	})(),
	sd = class extends ie {
		__isAsync
		destroyRef = void 0
		pendingTasks = void 0
		constructor(t = !1) {
			super(),
				(this.__isAsync = t),
				Jv() &&
					((this.destroyRef = g(ri, { optional: !0 }) ?? void 0),
					(this.pendingTasks = g(Ke, { optional: !0 }) ?? void 0))
		}
		emit(t) {
			let n = U(null)
			try {
				super.next(t)
			} finally {
				U(n)
			}
		}
		subscribe(t, n, r) {
			let i = t,
				o = n || (() => null),
				s = r
			if (t && typeof t == 'object') {
				let c = t
				;(i = c.next?.bind(c)),
					(o = c.error?.bind(c)),
					(s = c.complete?.bind(c))
			}
			this.__isAsync &&
				((o = this.wrapInTimeout(o)),
				i && (i = this.wrapInTimeout(i)),
				s && (s = this.wrapInTimeout(s)))
			let a = super.subscribe({ next: i, error: o, complete: s })
			return t instanceof X && t.add(a), a
		}
		wrapInTimeout(t) {
			return (n) => {
				let r = this.pendingTasks?.add()
				setTimeout(() => {
					t(n), r !== void 0 && this.pendingTasks?.remove(r)
				})
			}
		}
	},
	me = sd
function wa(...e) {}
function Uy(e) {
	let t, n
	function r() {
		e = wa
		try {
			n !== void 0 &&
				typeof cancelAnimationFrame == 'function' &&
				cancelAnimationFrame(n),
				t !== void 0 && clearTimeout(t)
		} catch {}
	}
	return (
		(t = setTimeout(() => {
			e(), r()
		})),
		typeof requestAnimationFrame == 'function' &&
			(n = requestAnimationFrame(() => {
				e(), r()
			})),
		() => r()
	)
}
function qm(e) {
	return (
		queueMicrotask(() => e()),
		() => {
			e = wa
		}
	)
}
var of = 'isAngularZone',
	Da = of + '_ID',
	fS = 0,
	j = class e {
		hasPendingMacrotasks = !1
		hasPendingMicrotasks = !1
		isStable = !0
		onUnstable = new me(!1)
		onMicrotaskEmpty = new me(!1)
		onStable = new me(!1)
		onError = new me(!1)
		constructor(t) {
			let {
				enableLongStackTrace: n = !1,
				shouldCoalesceEventChangeDetection: r = !1,
				shouldCoalesceRunChangeDetection: i = !1,
				scheduleInRootZone: o = Ly,
			} = t
			if (typeof Zone > 'u') throw new w(908, !1)
			Zone.assertZonePatched()
			let s = this
			;(s._nesting = 0),
				(s._outer = s._inner = Zone.current),
				Zone.TaskTrackingZoneSpec &&
					(s._inner = s._inner.fork(new Zone.TaskTrackingZoneSpec())),
				n &&
					Zone.longStackTraceZoneSpec &&
					(s._inner = s._inner.fork(Zone.longStackTraceZoneSpec)),
				(s.shouldCoalesceEventChangeDetection = !i && r),
				(s.shouldCoalesceRunChangeDetection = i),
				(s.callbackScheduled = !1),
				(s.scheduleInRootZone = o),
				gS(s)
		}
		static isInAngularZone() {
			return typeof Zone < 'u' && Zone.current.get(of) === !0
		}
		static assertInAngularZone() {
			if (!e.isInAngularZone()) throw new w(909, !1)
		}
		static assertNotInAngularZone() {
			if (e.isInAngularZone()) throw new w(909, !1)
		}
		run(t, n, r) {
			return this._inner.run(t, n, r)
		}
		runTask(t, n, r, i) {
			let o = this._inner,
				s = o.scheduleEventTask('NgZoneEvent: ' + i, t, hS, wa, wa)
			try {
				return o.runTask(s, n, r)
			} finally {
				o.cancelTask(s)
			}
		}
		runGuarded(t, n, r) {
			return this._inner.runGuarded(t, n, r)
		}
		runOutsideAngular(t) {
			return this._outer.run(t)
		}
	},
	hS = {}
function sf(e) {
	if (e._nesting == 0 && !e.hasPendingMicrotasks && !e.isStable)
		try {
			e._nesting++, e.onMicrotaskEmpty.emit(null)
		} finally {
			if ((e._nesting--, !e.hasPendingMicrotasks))
				try {
					e.runOutsideAngular(() => e.onStable.emit(null))
				} finally {
					e.isStable = !0
				}
		}
}
function pS(e) {
	if (e.isCheckStableRunning || e.callbackScheduled) return
	e.callbackScheduled = !0
	function t() {
		Uy(() => {
			;(e.callbackScheduled = !1),
				ad(e),
				(e.isCheckStableRunning = !0),
				sf(e),
				(e.isCheckStableRunning = !1)
		})
	}
	e.scheduleInRootZone
		? Zone.root.run(() => {
				t()
		  })
		: e._outer.run(() => {
				t()
		  }),
		ad(e)
}
function gS(e) {
	let t = () => {
			pS(e)
		},
		n = fS++
	e._inner = e._inner.fork({
		name: 'angular',
		properties: { [of]: !0, [Da]: n, [Da + n]: !0 },
		onInvokeTask: (r, i, o, s, a, c) => {
			if (mS(c)) return r.invokeTask(o, s, a, c)
			try {
				return Km(e), r.invokeTask(o, s, a, c)
			} finally {
				;((e.shouldCoalesceEventChangeDetection && s.type === 'eventTask') ||
					e.shouldCoalesceRunChangeDetection) &&
					t(),
					Ym(e)
			}
		},
		onInvoke: (r, i, o, s, a, c, u) => {
			try {
				return Km(e), r.invoke(o, s, a, c, u)
			} finally {
				e.shouldCoalesceRunChangeDetection &&
					!e.callbackScheduled &&
					!vS(c) &&
					t(),
					Ym(e)
			}
		},
		onHasTask: (r, i, o, s) => {
			r.hasTask(o, s),
				i === o &&
					(s.change == 'microTask'
						? ((e._hasPendingMicrotasks = s.microTask), ad(e), sf(e))
						: s.change == 'macroTask' && (e.hasPendingMacrotasks = s.macroTask))
		},
		onHandleError: (r, i, o, s) => (
			r.handleError(o, s), e.runOutsideAngular(() => e.onError.emit(s)), !1
		),
	})
}
function ad(e) {
	e._hasPendingMicrotasks ||
	((e.shouldCoalesceEventChangeDetection ||
		e.shouldCoalesceRunChangeDetection) &&
		e.callbackScheduled === !0)
		? (e.hasPendingMicrotasks = !0)
		: (e.hasPendingMicrotasks = !1)
}
function Km(e) {
	e._nesting++, e.isStable && ((e.isStable = !1), e.onUnstable.emit(null))
}
function Ym(e) {
	e._nesting--, sf(e)
}
var cd = class {
	hasPendingMicrotasks = !1
	hasPendingMacrotasks = !1
	isStable = !0
	onUnstable = new me()
	onMicrotaskEmpty = new me()
	onStable = new me()
	onError = new me()
	run(t, n, r) {
		return t.apply(n, r)
	}
	runGuarded(t, n, r) {
		return t.apply(n, r)
	}
	runOutsideAngular(t) {
		return t()
	}
	runTask(t, n, r, i) {
		return t.apply(n, r)
	}
}
function mS(e) {
	return By(e, '__ignore_ng_zone__')
}
function vS(e) {
	return By(e, '__scheduler_tick__')
}
function By(e, t) {
	return !Array.isArray(e) || e.length !== 1 ? !1 : e[0]?.data?.[t] === !0
}
var qt = class {
		_console = console
		handleError(t) {
			this._console.error('ERROR', t)
		}
	},
	yS = new E('', {
		providedIn: 'root',
		factory: () => {
			let e = g(j),
				t = g(qt)
			return (n) => e.runOutsideAngular(() => t.handleError(n))
		},
	})
function Zm(e, t) {
	return Ov(e, t)
}
function ES(e) {
	return Ov(Nv, e)
}
var $y = ((Zm.required = ES), Zm)
function _S() {
	return ii(be(), z())
}
function ii(e, t) {
	return new Ye(at(e, t))
}
var Ye = (() => {
	class e {
		nativeElement
		constructor(n) {
			this.nativeElement = n
		}
		static __NG_ELEMENT_ID__ = _S
	}
	return e
})()
function IS(e) {
	return e instanceof Ye ? e.nativeElement : e
}
function wS(e) {
	return typeof e == 'function' && e[Fe] !== void 0
}
function oi(e, t) {
	let n = $g(e),
		r = n[Fe]
	return (
		t?.equal && (r.equal = t.equal),
		(n.set = (i) => _s(r, i)),
		(n.update = (i) => Hg(r, i)),
		(n.asReadonly = DS.bind(n)),
		n
	)
}
function DS() {
	let e = this[Fe]
	if (e.readonlyFn === void 0) {
		let t = () => this()
		;(t[Fe] = e), (e.readonlyFn = t)
	}
	return e.readonlyFn
}
function Hy(e) {
	return wS(e) && typeof e.set == 'function'
}
function bS() {
	return this._results[Symbol.iterator]()
}
var ud = class {
		_emitDistinctChangesOnly
		dirty = !0
		_onDirty = void 0
		_results = []
		_changesDetected = !1
		_changes = void 0
		length = 0
		first = void 0
		last = void 0
		get changes() {
			return (this._changes ??= new ie())
		}
		constructor(t = !1) {
			this._emitDistinctChangesOnly = t
		}
		get(t) {
			return this._results[t]
		}
		map(t) {
			return this._results.map(t)
		}
		filter(t) {
			return this._results.filter(t)
		}
		find(t) {
			return this._results.find(t)
		}
		reduce(t, n) {
			return this._results.reduce(t, n)
		}
		forEach(t) {
			this._results.forEach(t)
		}
		some(t) {
			return this._results.some(t)
		}
		toArray() {
			return this._results.slice()
		}
		toString() {
			return this._results.toString()
		}
		reset(t, n) {
			this.dirty = !1
			let r = cT(t)
			;(this._changesDetected = !aT(this._results, r, n)) &&
				((this._results = r),
				(this.length = r.length),
				(this.last = r[this.length - 1]),
				(this.first = r[0]))
		}
		notifyOnChanges() {
			this._changes !== void 0 &&
				(this._changesDetected || !this._emitDistinctChangesOnly) &&
				this._changes.next(this)
		}
		onDirty(t) {
			this._onDirty = t
		}
		setDirty() {
			;(this.dirty = !0), this._onDirty?.()
		}
		destroy() {
			this._changes !== void 0 &&
				(this._changes.complete(), this._changes.unsubscribe())
		}
		[Symbol.iterator] = bS
	},
	CS = 'ngSkipHydration',
	TS = 'ngskiphydration'
function zy(e) {
	let t = e.mergedAttrs
	if (t === null) return !1
	for (let n = 0; n < t.length; n += 2) {
		let r = t[n]
		if (typeof r == 'number') return !1
		if (typeof r == 'string' && r.toLowerCase() === TS) return !0
	}
	return !1
}
function Wy(e) {
	return e.hasAttribute(CS)
}
function ba(e) {
	return (e.flags & 128) === 128
}
function SS(e) {
	if (ba(e)) return !0
	let t = e.parent
	for (; t; ) {
		if (ba(e) || zy(t)) return !0
		t = t.parent
	}
	return !1
}
var Gy = (function (e) {
		return (e[(e.OnPush = 0)] = 'OnPush'), (e[(e.Default = 1)] = 'Default'), e
	})(Gy || {}),
	qy = new Map(),
	AS = 0
function MS() {
	return AS++
}
function RS(e) {
	qy.set(e[$a], e)
}
function ld(e) {
	qy.delete(e[$a])
}
var Qm = '__ngContext__'
function si(e, t) {
	rt(t) ? ((e[Qm] = t[$a]), RS(t)) : (e[Qm] = t)
}
function Ky(e) {
	return Zy(e[Ji])
}
function Yy(e) {
	return Zy(e[nt])
}
function Zy(e) {
	for (; e !== null && !Ct(e); ) e = e[nt]
	return e
}
var dd
function Qy(e) {
	dd = e
}
function Za() {
	if (dd !== void 0) return dd
	if (typeof document < 'u') return document
	throw new w(210, !1)
}
var tr = new E('', { providedIn: 'root', factory: () => NS }),
	NS = 'ng',
	af = new E(''),
	ye = new E('', { providedIn: 'platform', factory: () => 'unknown' })
var cf = new E('', {
	providedIn: 'root',
	factory: () =>
		Za().body?.querySelector('[ngCspNonce]')?.getAttribute('ngCspNonce') ||
		null,
})
function OS() {
	let e = new ai()
	return (e.store = kS(Za(), g(tr))), e
}
var ai = (() => {
	class e {
		static ɵprov = _({ token: e, providedIn: 'root', factory: OS })
		store = {}
		onSerializeCallbacks = {}
		get(n, r) {
			return this.store[n] !== void 0 ? this.store[n] : r
		}
		set(n, r) {
			this.store[n] = r
		}
		remove(n) {
			delete this.store[n]
		}
		hasKey(n) {
			return this.store.hasOwnProperty(n)
		}
		get isEmpty() {
			return Object.keys(this.store).length === 0
		}
		onSerialize(n, r) {
			this.onSerializeCallbacks[n] = r
		}
		toJson() {
			for (let n in this.onSerializeCallbacks)
				if (this.onSerializeCallbacks.hasOwnProperty(n))
					try {
						this.store[n] = this.onSerializeCallbacks[n]()
					} catch (r) {
						console.warn('Exception in onSerialize callback: ', r)
					}
			return JSON.stringify(this.store).replace(/</g, '\\u003C')
		}
	}
	return e
})()
function kS(e, t) {
	let n = e.getElementById(t + '-state')
	if (n?.textContent)
		try {
			return JSON.parse(n.textContent)
		} catch (r) {
			console.warn('Exception while restoring TransferState for app ' + t, r)
		}
	return {}
}
var Jy = 'h',
	Xy = 'b',
	xS = 'f',
	PS = 'n',
	FS = 'e',
	LS = 't',
	uf = 'c',
	eE = 'x',
	Ca = 'r',
	VS = 'i',
	jS = 'n',
	tE = 'd'
var US = 'di',
	BS = 's',
	$S = 'p'
var Js = new E(''),
	nE = !1,
	rE = new E('', { providedIn: 'root', factory: () => nE })
var iE = new E(''),
	HS = !1,
	zS = new E(''),
	Jm = new E('', { providedIn: 'root', factory: () => new Map() }),
	lf = (function (e) {
		return (
			(e[(e.CHANGE_DETECTION = 0)] = 'CHANGE_DETECTION'),
			(e[(e.AFTER_NEXT_RENDER = 1)] = 'AFTER_NEXT_RENDER'),
			e
		)
	})(lf || {}),
	ci = new E(''),
	Xm = new Set()
function wn(e) {
	Xm.has(e) ||
		(Xm.add(e),
		performance?.mark?.('mark_feature_usage', { detail: { feature: e } }))
}
var oE = (() => {
	class e {
		view
		node
		constructor(n, r) {
			;(this.view = n), (this.node = r)
		}
		static __NG_ELEMENT_ID__ = WS
	}
	return e
})()
function WS() {
	return new oE(z(), be())
}
var Fr = (function (e) {
		return (
			(e[(e.EarlyRead = 0)] = 'EarlyRead'),
			(e[(e.Write = 1)] = 'Write'),
			(e[(e.MixedReadWrite = 2)] = 'MixedReadWrite'),
			(e[(e.Read = 3)] = 'Read'),
			e
		)
	})(Fr || {}),
	sE = (() => {
		class e {
			impl = null
			execute() {
				this.impl?.execute()
			}
			static ɵprov = _({ token: e, providedIn: 'root', factory: () => new e() })
		}
		return e
	})(),
	GS = [Fr.EarlyRead, Fr.Write, Fr.MixedReadWrite, Fr.Read],
	qS = (() => {
		class e {
			ngZone = g(j)
			scheduler = g(er)
			errorHandler = g(qt, { optional: !0 })
			sequences = new Set()
			deferredRegistrations = new Set()
			executing = !1
			constructor() {
				g(ci, { optional: !0 })
			}
			execute() {
				let n = this.sequences.size > 0
				n && G(16), (this.executing = !0)
				for (let r of GS)
					for (let i of this.sequences)
						if (!(i.erroredOrDestroyed || !i.hooks[r]))
							try {
								i.pipelinedValue = this.ngZone.runOutsideAngular(() =>
									this.maybeTrace(() => {
										let o = i.hooks[r]
										return o(i.pipelinedValue)
									}, i.snapshot)
								)
							} catch (o) {
								;(i.erroredOrDestroyed = !0), this.errorHandler?.handleError(o)
							}
				this.executing = !1
				for (let r of this.sequences)
					r.afterRun(), r.once && (this.sequences.delete(r), r.destroy())
				for (let r of this.deferredRegistrations) this.sequences.add(r)
				this.deferredRegistrations.size > 0 && this.scheduler.notify(7),
					this.deferredRegistrations.clear(),
					n && G(17)
			}
			register(n) {
				let { view: r } = n
				r !== void 0
					? ((r[jr] ??= []).push(n), oo(r), (r[R] |= 8192))
					: this.executing
					? this.deferredRegistrations.add(n)
					: this.addSequence(n)
			}
			addSequence(n) {
				this.sequences.add(n), this.scheduler.notify(7)
			}
			unregister(n) {
				this.executing && this.sequences.has(n)
					? ((n.erroredOrDestroyed = !0),
					  (n.pipelinedValue = void 0),
					  (n.once = !0))
					: (this.sequences.delete(n), this.deferredRegistrations.delete(n))
			}
			maybeTrace(n, r) {
				return r ? r.run(lf.AFTER_NEXT_RENDER, n) : n()
			}
			static ɵprov = _({ token: e, providedIn: 'root', factory: () => new e() })
		}
		return e
	})(),
	fd = class {
		impl
		hooks
		view
		once
		snapshot
		erroredOrDestroyed = !1
		pipelinedValue = void 0
		unregisterOnDestroy
		constructor(t, n, r, i, o, s = null) {
			;(this.impl = t),
				(this.hooks = n),
				(this.view = r),
				(this.once = i),
				(this.snapshot = s),
				(this.unregisterOnDestroy = o?.onDestroy(() => this.destroy()))
		}
		afterRun() {
			;(this.erroredOrDestroyed = !1),
				(this.pipelinedValue = void 0),
				this.snapshot?.dispose(),
				(this.snapshot = null)
		}
		destroy() {
			this.impl.unregister(this), this.unregisterOnDestroy?.()
			let t = this.view?.[jr]
			t && (this.view[jr] = t.filter((n) => n !== this))
		}
	}
function Qa(e, t) {
	!t?.injector && Ba(Qa)
	let n = t?.injector ?? g(ae)
	return wn('NgAfterNextRender'), YS(e, n, t, !0)
}
function KS(e, t) {
	if (e instanceof Function) {
		let n = [void 0, void 0, void 0, void 0]
		return (n[t] = e), n
	} else return [e.earlyRead, e.write, e.mixedReadWrite, e.read]
}
function YS(e, t, n, r) {
	let i = t.get(sE)
	i.impl ??= t.get(qS)
	let o = t.get(ci, null, { optional: !0 }),
		s = n?.phase ?? Fr.MixedReadWrite,
		a = n?.manualCleanup !== !0 ? t.get(ri) : null,
		c = t.get(oE, null, { optional: !0 }),
		u = new fd(i.impl, KS(e, s), c?.view, r, a, o?.snapshot(null))
	return i.impl.register(u), u
}
var Ve = (function (e) {
		return (
			(e[(e.NOT_STARTED = 0)] = 'NOT_STARTED'),
			(e[(e.IN_PROGRESS = 1)] = 'IN_PROGRESS'),
			(e[(e.COMPLETE = 2)] = 'COMPLETE'),
			(e[(e.FAILED = 3)] = 'FAILED'),
			e
		)
	})(Ve || {}),
	ev = 0,
	ZS = 1,
	le = (function (e) {
		return (
			(e[(e.Placeholder = 0)] = 'Placeholder'),
			(e[(e.Loading = 1)] = 'Loading'),
			(e[(e.Complete = 2)] = 'Complete'),
			(e[(e.Error = 3)] = 'Error'),
			e
		)
	})(le || {})
var QS = 0,
	Ja = 1
var JS = 4,
	XS = 5
var e0 = 7,
	$r = 8,
	t0 = 9,
	aE = (function (e) {
		return (
			(e[(e.Manual = 0)] = 'Manual'),
			(e[(e.Playthrough = 1)] = 'Playthrough'),
			e
		)
	})(aE || {})
function sa(e, t) {
	let n = r0(e),
		r = t[n]
	if (r !== null) {
		for (let i of r) i()
		t[n] = null
	}
}
function n0(e) {
	sa(1, e), sa(0, e), sa(2, e)
}
function r0(e) {
	let t = JS
	return e === 1 ? (t = XS) : e === 2 && (t = t0), t
}
function cE(e) {
	return e + 1
}
function co(e, t) {
	let n = e[S],
		r = cE(t.index)
	return e[r]
}
function Xa(e, t) {
	let n = cE(t.index)
	return e.data[n]
}
function i0(e, t, n) {
	let r = t[S],
		i = Xa(r, n)
	switch (e) {
		case le.Complete:
			return i.primaryTmplIndex
		case le.Loading:
			return i.loadingTmplIndex
		case le.Error:
			return i.errorTmplIndex
		case le.Placeholder:
			return i.placeholderTmplIndex
		default:
			return null
	}
}
function tv(e, t) {
	return t === le.Placeholder
		? e.placeholderBlockConfig?.[ev] ?? null
		: t === le.Loading
		? e.loadingBlockConfig?.[ev] ?? null
		: null
}
function o0(e) {
	return e.loadingBlockConfig?.[ZS] ?? null
}
function nv(e, t) {
	if (!e || e.length === 0) return t
	let n = new Set(e)
	for (let r of t) n.add(r)
	return e.length === n.size ? e : Array.from(n)
}
function s0(e, t) {
	let n = t.primaryTmplIndex + te
	return za(e, n)
}
var ec = 'ngb'
var a0 = (e, t, n) => {
		let r = e,
			i = r.__jsaction_fns ?? new Map(),
			o = i.get(t) ?? []
		o.push(n), i.set(t, o), (r.__jsaction_fns = i)
	},
	c0 = (e, t) => {
		let n = e,
			r = n.getAttribute(ec) ?? '',
			i = t.get(r) ?? new Set()
		i.has(n) || i.add(n), t.set(r, i)
	}
var u0 = (e) => {
		e.removeAttribute(bl.JSACTION),
			e.removeAttribute(ec),
			(e.__jsaction_fns = void 0)
	},
	l0 = new E('', { providedIn: 'root', factory: () => ({}) })
function uE(e, t) {
	let n = t?.__jsaction_fns?.get(e.type)
	if (!(!n || !t?.isConnected)) for (let r of n) r(e)
}
var df = new E('')
var d0 = '__nghData__',
	lE = d0,
	f0 = '__nghDeferData__',
	h0 = f0,
	Fl = 'ngh',
	p0 = 'nghm',
	dE = () => null
function g0(e, t, n = !1) {
	let r = e.getAttribute(Fl)
	if (r == null) return null
	let [i, o] = r.split('|')
	if (((r = n ? o : i), !r)) return null
	let s = o ? `|${o}` : '',
		a = n ? i : s,
		c = {}
	if (r !== '') {
		let l = t.get(ai, null, { optional: !0 })
		l !== null && (c = l.get(lE, [])[Number(r)])
	}
	let u = { data: c, firstChild: e.firstChild ?? null }
	return (
		n && ((u.firstChild = e), tc(u, 0, e.nextSibling)),
		a ? e.setAttribute(Fl, a) : e.removeAttribute(Fl),
		u
	)
}
function m0() {
	dE = g0
}
function fE(e, t, n = !1) {
	return dE(e, t, n)
}
function v0(e) {
	let t = e._lView
	return t[S].type === 2 ? null : (Xi(t) && (t = t[te]), t)
}
function y0(e) {
	return e.textContent?.replace(/\s/gm, '')
}
function E0(e) {
	let t = Za(),
		n = t.createNodeIterator(e, NodeFilter.SHOW_COMMENT, {
			acceptNode(o) {
				let s = y0(o)
				return s === 'ngetn' || s === 'ngtns'
					? NodeFilter.FILTER_ACCEPT
					: NodeFilter.FILTER_REJECT
			},
		}),
		r,
		i = []
	for (; (r = n.nextNode()); ) i.push(r)
	for (let o of i)
		o.textContent === 'ngetn' ? o.replaceWith(t.createTextNode('')) : o.remove()
}
function tc(e, t, n) {
	;(e.segmentHeads ??= {}), (e.segmentHeads[t] = n)
}
function hd(e, t) {
	return e.segmentHeads?.[t] ?? null
}
function _0(e) {
	return e.get(zS, !1, { optional: !0 })
}
function I0(e, t) {
	let n = e.data,
		r = n[FS]?.[t] ?? null
	return r === null && n[uf]?.[t] && (r = ff(e, t)), r
}
function hE(e, t) {
	return e.data[uf]?.[t] ?? null
}
function ff(e, t) {
	let n = hE(e, t) ?? [],
		r = 0
	for (let i of n) r += i[Ca] * (i[eE] ?? 1)
	return r
}
function w0(e) {
	if (typeof e.disconnectedNodes > 'u') {
		let t = e.data[tE]
		e.disconnectedNodes = t ? new Set(t) : null
	}
	return e.disconnectedNodes
}
function uo(e, t) {
	if (typeof e.disconnectedNodes > 'u') {
		let n = e.data[tE]
		e.disconnectedNodes = n ? new Set(n) : null
	}
	return !!w0(e)?.has(t)
}
function D0(e, t) {
	let n = t.get(df),
		i = t.get(ai).get(h0, {}),
		o = !1,
		s = e,
		a = null,
		c = []
	for (; !o && s; ) {
		o = n.has(s)
		let u = n.hydrating.get(s)
		if (a === null && u != null) {
			a = u.promise
			break
		}
		c.unshift(s), (s = i[s][$S])
	}
	return { parentBlockPromise: a, hydrationQueue: c }
}
function pE(e, t) {
	let n = e.contentQueries
	if (n !== null) {
		let r = U(null)
		try {
			for (let i = 0; i < n.length; i += 2) {
				let o = n[i],
					s = n[i + 1]
				if (s !== -1) {
					let a = e.data[s]
					Qd(o), a.contentQueries(2, t[s], s)
				}
			}
		} finally {
			U(r)
		}
	}
}
function pd(e, t, n) {
	Qd(0)
	let r = U(null)
	try {
		t(e, n)
	} finally {
		U(r)
	}
}
function hf(e, t, n) {
	if (qd(t)) {
		let r = U(null)
		try {
			let i = t.directiveStart,
				o = t.directiveEnd
			for (let s = i; s < o; s++) {
				let a = e.data[s]
				if (a.contentQueries) {
					let c = n[s]
					a.contentQueries(1, c, s)
				}
			}
		} finally {
			U(r)
		}
	}
}
var bt = (function (e) {
	return (
		(e[(e.Emulated = 0)] = 'Emulated'),
		(e[(e.None = 2)] = 'None'),
		(e[(e.ShadowDom = 3)] = 'ShadowDom'),
		e
	)
})(bt || {})
var Xs
function b0() {
	if (Xs === void 0 && ((Xs = null), _t.trustedTypes))
		try {
			Xs = _t.trustedTypes.createPolicy('angular#unsafe-bypass', {
				createHTML: (e) => e,
				createScript: (e) => e,
				createScriptURL: (e) => e,
			})
		} catch {}
	return Xs
}
function rv(e) {
	return b0()?.createScriptURL(e) || e
}
var Ta = class {
	changingThisBreaksApplicationSecurity
	constructor(t) {
		this.changingThisBreaksApplicationSecurity = t
	}
	toString() {
		return `SafeValue must use [property]=binding: ${this.changingThisBreaksApplicationSecurity} (see ${Rv})`
	}
}
function lo(e) {
	return e instanceof Ta ? e.changingThisBreaksApplicationSecurity : e
}
function pf(e, t) {
	let n = C0(e)
	if (n != null && n !== t) {
		if (n === 'ResourceURL' && t === 'URL') return !0
		throw new Error(`Required a safe ${t}, got a ${n} (see ${Rv})`)
	}
	return n === t
}
function C0(e) {
	return (e instanceof Ta && e.getTypeName()) || null
}
var T0 = /^(?!javascript:)(?:[a-z0-9+.-]+:|[^&:\/?#]*(?:[\/?#]|$))/i
function gE(e) {
	return (e = String(e)), e.match(T0) ? e : 'unsafe:' + e
}
var nc = (function (e) {
	return (
		(e[(e.NONE = 0)] = 'NONE'),
		(e[(e.HTML = 1)] = 'HTML'),
		(e[(e.STYLE = 2)] = 'STYLE'),
		(e[(e.SCRIPT = 3)] = 'SCRIPT'),
		(e[(e.URL = 4)] = 'URL'),
		(e[(e.RESOURCE_URL = 5)] = 'RESOURCE_URL'),
		e
	)
})(nc || {})
function S0(e) {
	let t = vE()
	return t ? t.sanitize(nc.URL, e) || '' : pf(e, 'URL') ? lo(e) : gE(Va(e))
}
function A0(e) {
	let t = vE()
	if (t) return rv(t.sanitize(nc.RESOURCE_URL, e) || '')
	if (pf(e, 'ResourceURL')) return rv(lo(e))
	throw new w(904, !1)
}
function M0(e, t) {
	return (t === 'src' &&
		(e === 'embed' ||
			e === 'frame' ||
			e === 'iframe' ||
			e === 'media' ||
			e === 'script')) ||
		(t === 'href' && (e === 'base' || e === 'link'))
		? A0
		: S0
}
function mE(e, t, n) {
	return M0(t, n)(e)
}
function vE() {
	let e = z()
	return e && e[Ht].sanitizer
}
var R0 = /^>|^->|<!--|-->|--!>|<!-$/g,
	N0 = /(<|>)/g,
	O0 = '\u200B$1\u200B'
function k0(e) {
	return e.replace(R0, (t) => t.replace(N0, O0))
}
function x0(e) {
	return e.ownerDocument.body
}
function yE(e) {
	return e instanceof Function ? e() : e
}
function P0(e, t, n) {
	let r = e.length
	for (;;) {
		let i = e.indexOf(t, n)
		if (i === -1) return i
		if (i === 0 || e.charCodeAt(i - 1) <= 32) {
			let o = t.length
			if (i + o === r || e.charCodeAt(i + o) <= 32) return i
		}
		n = i + 1
	}
}
var EE = 'ng-template'
function F0(e, t, n, r) {
	let i = 0
	if (r) {
		for (; i < t.length && typeof t[i] == 'string'; i += 2)
			if (t[i] === 'class' && P0(t[i + 1].toLowerCase(), n, 0) !== -1) return !0
	} else if (gf(e)) return !1
	if (((i = t.indexOf(1, i)), i > -1)) {
		let o
		for (; ++i < t.length && typeof (o = t[i]) == 'string'; )
			if (o.toLowerCase() === n) return !0
	}
	return !1
}
function gf(e) {
	return e.type === 4 && e.value !== EE
}
function L0(e, t, n) {
	let r = e.type === 4 && !n ? EE : e.value
	return t === r
}
function V0(e, t, n) {
	let r = 4,
		i = e.attrs,
		o = i !== null ? B0(i) : 0,
		s = !1
	for (let a = 0; a < t.length; a++) {
		let c = t[a]
		if (typeof c == 'number') {
			if (!s && !tt(r) && !tt(c)) return !1
			if (s && tt(c)) continue
			;(s = !1), (r = c | (r & 1))
			continue
		}
		if (!s)
			if (r & 4) {
				if (
					((r = 2 | (r & 1)),
					(c !== '' && !L0(e, c, n)) || (c === '' && t.length === 1))
				) {
					if (tt(r)) return !1
					s = !0
				}
			} else if (r & 8) {
				if (i === null || !F0(e, i, c, n)) {
					if (tt(r)) return !1
					s = !0
				}
			} else {
				let u = t[++a],
					l = j0(c, i, gf(e), n)
				if (l === -1) {
					if (tt(r)) return !1
					s = !0
					continue
				}
				if (u !== '') {
					let d
					if (
						(l > o ? (d = '') : (d = i[l + 1].toLowerCase()), r & 2 && u !== d)
					) {
						if (tt(r)) return !1
						s = !0
					}
				}
			}
	}
	return tt(r) || s
}
function tt(e) {
	return (e & 1) === 0
}
function j0(e, t, n, r) {
	if (t === null) return -1
	let i = 0
	if (r || !n) {
		let o = !1
		for (; i < t.length; ) {
			let s = t[i]
			if (s === e) return i
			if (s === 3 || s === 6) o = !0
			else if (s === 1 || s === 2) {
				let a = t[++i]
				for (; typeof a == 'string'; ) a = t[++i]
				continue
			} else {
				if (s === 4) break
				if (s === 0) {
					i += 4
					continue
				}
			}
			i += o ? 1 : 2
		}
		return -1
	} else return $0(t, e)
}
function U0(e, t, n = !1) {
	for (let r = 0; r < t.length; r++) if (V0(e, t[r], n)) return !0
	return !1
}
function B0(e) {
	for (let t = 0; t < e.length; t++) {
		let n = e[t]
		if (Ty(n)) return t
	}
	return e.length
}
function $0(e, t) {
	let n = e.indexOf(4)
	if (n > -1)
		for (n++; n < e.length; ) {
			let r = e[n]
			if (typeof r == 'number') return -1
			if (r === t) return n
			n++
		}
	return -1
}
function iv(e, t) {
	return e ? ':not(' + t.trim() + ')' : t
}
function H0(e) {
	let t = e[0],
		n = 1,
		r = 2,
		i = '',
		o = !1
	for (; n < e.length; ) {
		let s = e[n]
		if (typeof s == 'string')
			if (r & 2) {
				let a = e[++n]
				i += '[' + s + (a.length > 0 ? '="' + a + '"' : '') + ']'
			} else r & 8 ? (i += '.' + s) : r & 4 && (i += ' ' + s)
		else
			i !== '' && !tt(s) && ((t += iv(o, i)), (i = '')),
				(r = s),
				(o = o || !tt(r))
		n++
	}
	return i !== '' && (t += iv(o, i)), t
}
function z0(e) {
	return e.map(H0).join(',')
}
function W0(e) {
	let t = [],
		n = [],
		r = 1,
		i = 2
	for (; r < e.length; ) {
		let o = e[r]
		if (typeof o == 'string')
			i === 2 ? o !== '' && t.push(o, e[++r]) : i === 8 && n.push(o)
		else {
			if (!tt(i)) break
			i = o
		}
		r++
	}
	return n.length && t.push(1, ...n), t
}
var ar = {}
function _E(e, t) {
	return e.createText(t)
}
function G0(e, t, n) {
	e.setValue(t, n)
}
function IE(e, t) {
	return e.createComment(k0(t))
}
function mf(e, t, n) {
	return e.createElement(t, n)
}
function Sa(e, t, n, r, i) {
	e.insertBefore(t, n, r, i)
}
function wE(e, t, n) {
	e.appendChild(t, n)
}
function ov(e, t, n, r, i) {
	r !== null ? Sa(e, t, n, r, i) : wE(e, t, n)
}
function vf(e, t, n) {
	e.removeChild(null, t, n)
}
function DE(e) {
	e.textContent = ''
}
function q0(e, t, n) {
	e.setAttribute(t, 'style', n)
}
function K0(e, t, n) {
	n === '' ? e.removeAttribute(t, 'class') : e.setAttribute(t, 'class', n)
}
function bE(e, t, n) {
	let { mergedAttrs: r, classes: i, styles: o } = n
	r !== null && XT(e, t, r),
		i !== null && K0(e, t, i),
		o !== null && q0(e, t, o)
}
function yf(e, t, n, r, i, o, s, a, c, u, l) {
	let d = te + r,
		h = d + i,
		f = Y0(d, h),
		m = typeof u == 'function' ? u() : u
	return (f[S] = {
		type: e,
		blueprint: f,
		template: n,
		queries: null,
		viewQuery: a,
		declTNode: t,
		data: f.slice().fill(null, d),
		bindingStartIndex: d,
		expandoStartIndex: h,
		hostBindingOpCodes: null,
		firstCreatePass: !0,
		firstUpdatePass: !0,
		staticViewQueries: !1,
		staticContentQueries: !1,
		preOrderHooks: null,
		preOrderCheckHooks: null,
		contentHooks: null,
		contentCheckHooks: null,
		viewHooks: null,
		viewCheckHooks: null,
		destroyHooks: null,
		cleanup: null,
		contentQueries: null,
		components: null,
		directiveRegistry: typeof o == 'function' ? o() : o,
		pipeRegistry: typeof s == 'function' ? s() : s,
		firstChild: null,
		schemas: c,
		consts: m,
		incompleteFirstPass: !1,
		ssrId: l,
	})
}
function Y0(e, t) {
	let n = []
	for (let r = 0; r < t; r++) n.push(r < e ? null : ar)
	return n
}
function Z0(e) {
	let t = e.tView
	return t === null || t.incompleteFirstPass
		? (e.tView = yf(
				1,
				null,
				e.template,
				e.decls,
				e.vars,
				e.directiveDefs,
				e.pipeDefs,
				e.viewQuery,
				e.schemas,
				e.consts,
				e.id
		  ))
		: t
}
function Ef(e, t, n, r, i, o, s, a, c, u, l) {
	let d = t.blueprint.slice()
	return (
		(d[je] = i),
		(d[R] = r | 4 | 128 | 8 | 64 | 1024),
		(u !== null || (e && e[R] & 2048)) && (d[R] |= 2048),
		cy(d),
		(d[de] = d[Qr] = e),
		(d[xe] = n),
		(d[Ht] = s || (e && e[Ht])),
		(d[Q] = a || (e && e[Q])),
		(d[En] = c || (e && e[En]) || null),
		(d[st] = o),
		(d[$a] = MS()),
		(d[It] = l),
		(d[Xv] = u),
		(d[Ge] = t.type == 2 ? e[Ge] : d),
		d
	)
}
function Q0(e, t, n) {
	let r = at(t, e),
		i = Z0(n),
		o = e[Ht].rendererFactory,
		s = _f(
			e,
			Ef(
				e,
				i,
				null,
				CE(n),
				r,
				t,
				null,
				o.createRenderer(r, n),
				null,
				null,
				null
			)
		)
	return (e[t.index] = s)
}
function CE(e) {
	let t = 16
	return e.signals ? (t = 4096) : e.onPush && (t = 64), t
}
function TE(e, t, n, r) {
	if (n === 0) return -1
	let i = t.length
	for (let o = 0; o < n; o++) t.push(r), e.blueprint.push(r), e.data.push(null)
	return i
}
function _f(e, t) {
	return e[Ji] ? (e[jm][nt] = t) : (e[Ji] = t), (e[jm] = t), t
}
function ne(e = 1) {
	SE(pe(), z(), ti() + e, !1)
}
function SE(e, t, n, r) {
	if (!r)
		if ((t[R] & 3) === 3) {
			let o = e.preOrderCheckHooks
			o !== null && ra(t, o, n)
		} else {
			let o = e.preOrderHooks
			o !== null && ia(t, o, 0, n)
		}
	Jn(n)
}
var rc = (function (e) {
	return (
		(e[(e.None = 0)] = 'None'),
		(e[(e.SignalBased = 1)] = 'SignalBased'),
		(e[(e.HasDecoratorInputTransform = 2)] = 'HasDecoratorInputTransform'),
		e
	)
})(rc || {})
function gd(e, t, n, r) {
	let i = U(null)
	try {
		let [o, s, a] = e.inputs[n],
			c = null
		;(s & rc.SignalBased) !== 0 && (c = t[o][Fe]),
			c !== null && c.transformFn !== void 0
				? (r = c.transformFn(r))
				: a !== null && (r = a.call(t, r)),
			e.setInput !== null ? e.setInput(t, c, r, n, o) : ty(t, c, o, r)
	} finally {
		U(i)
	}
}
function AE(e, t, n, r, i) {
	let o = ti(),
		s = r & 2
	try {
		Jn(-1), s && t.length > te && SE(e, t, te, !1), G(s ? 2 : 0, i), n(r, i)
	} finally {
		Jn(o), G(s ? 3 : 1, i)
	}
}
function ic(e, t, n) {
	iA(e, t, n), (n.flags & 64) === 64 && oA(e, t, n)
}
function If(e, t, n = at) {
	let r = t.localNames
	if (r !== null) {
		let i = t.index + 1
		for (let o = 0; o < r.length; o += 2) {
			let s = r[o + 1],
				a = s === -1 ? n(t, e) : e[s]
			e[i++] = a
		}
	}
}
function J0(e, t, n, r) {
	let o = r.get(rE, nE) || n === bt.ShadowDom,
		s = e.selectRootElement(t, o)
	return X0(s), s
}
function X0(e) {
	ME(e)
}
var ME = () => null
function eA(e) {
	Wy(e) ? DE(e) : E0(e)
}
function tA() {
	ME = eA
}
function nA(e) {
	return e === 'class'
		? 'className'
		: e === 'for'
		? 'htmlFor'
		: e === 'formaction'
		? 'formAction'
		: e === 'innerHtml'
		? 'innerHTML'
		: e === 'readonly'
		? 'readOnly'
		: e === 'tabindex'
		? 'tabIndex'
		: e
}
function RE(e, t, n, r, i, o, s, a) {
	if (!a && Df(t, e, n, r, i)) {
		ir(t) && rA(n, t.index)
		return
	}
	if (t.type & 3) {
		let c = at(t, n)
		;(r = nA(r)),
			(i = s != null ? s(i, t.value || '', r) : i),
			o.setProperty(c, r, i)
	} else t.type & 12
}
function rA(e, t) {
	let n = Dt(t, e)
	n[R] & 16 || (n[R] |= 64)
}
function iA(e, t, n) {
	let r = n.directiveStart,
		i = n.directiveEnd
	ir(n) && Q0(t, n, e.data[r + n.componentOffset]),
		e.firstCreatePass || Ia(n, t)
	let o = n.initialInputs
	for (let s = r; s < i; s++) {
		let a = e.data[s],
			c = eo(t, e, s, n)
		if ((si(c, t), o !== null && uA(t, s - r, c, a, n, o), wt(a))) {
			let u = Dt(n.index, t)
			u[xe] = eo(t, e, s, n)
		}
	}
}
function oA(e, t, n) {
	let r = n.directiveStart,
		i = n.directiveEnd,
		o = n.index,
		s = zT()
	try {
		Jn(o)
		for (let a = r; a < i; a++) {
			let c = e.data[a],
				u = t[a]
			td(a),
				(c.hostBindings !== null || c.hostVars !== 0 || c.hostAttrs !== null) &&
					sA(c, u)
		}
	} finally {
		Jn(-1), td(s)
	}
}
function sA(e, t) {
	e.hostBindings !== null && e.hostBindings(1, t)
}
function wf(e, t) {
	let n = e.directiveRegistry,
		r = null
	if (n)
		for (let i = 0; i < n.length; i++) {
			let o = n[i]
			U0(t, o.selectors, !1) && ((r ??= []), wt(o) ? r.unshift(o) : r.push(o))
		}
	return r
}
function aA(e, t, n, r, i, o) {
	let s = at(e, t)
	cA(t[Q], s, o, e.value, n, r, i)
}
function cA(e, t, n, r, i, o, s) {
	if (o == null) e.removeAttribute(t, i, n)
	else {
		let a = s == null ? Va(o) : s(o, r || '', i)
		e.setAttribute(t, i, a, n)
	}
}
function uA(e, t, n, r, i, o) {
	let s = o[t]
	if (s !== null)
		for (let a = 0; a < s.length; a += 2) {
			let c = s[a],
				u = s[a + 1]
			gd(r, n, c, u)
		}
}
function oc(e, t) {
	let n = e[En],
		r = n ? n.get(qt, null) : null
	r && r.handleError(t)
}
function Df(e, t, n, r, i) {
	let o = e.inputs?.[r],
		s = e.hostDirectiveInputs?.[r],
		a = !1
	if (s)
		for (let c = 0; c < s.length; c += 2) {
			let u = s[c],
				l = s[c + 1],
				d = t.data[u]
			gd(d, n[u], l, i), (a = !0)
		}
	if (o)
		for (let c of o) {
			let u = n[c],
				l = t.data[c]
			gd(l, u, r, i), (a = !0)
		}
	return a
}
function lA(e, t) {
	let n = Dt(t, e),
		r = n[S]
	dA(r, n)
	let i = n[je]
	i !== null && n[It] === null && (n[It] = fE(i, n[En])),
		G(18),
		bf(r, n, n[xe]),
		G(19, n[xe])
}
function dA(e, t) {
	for (let n = t.length; n < e.blueprint.length; n++) t.push(e.blueprint[n])
}
function bf(e, t, n) {
	Jd(t)
	try {
		let r = e.viewQuery
		r !== null && pd(1, r, n)
		let i = e.template
		i !== null && AE(e, t, i, 1, n),
			e.firstCreatePass && (e.firstCreatePass = !1),
			t[zt]?.finishViewCreation(e),
			e.staticContentQueries && pE(e, t),
			e.staticViewQueries && pd(2, e.viewQuery, n)
		let o = e.components
		o !== null && fA(t, o)
	} catch (r) {
		throw (
			(e.firstCreatePass &&
				((e.incompleteFirstPass = !0), (e.firstCreatePass = !1)),
			r)
		)
	} finally {
		;(t[R] &= -5), Xd()
	}
}
function fA(e, t) {
	for (let n = 0; n < t.length; n++) lA(e, t[n])
}
function NE(e, t, n, r) {
	let i = U(null)
	try {
		let o = t.tView,
			a = e[R] & 4096 ? 4096 : 16,
			c = Ef(
				e,
				o,
				n,
				a,
				null,
				t,
				null,
				null,
				r?.injector ?? null,
				r?.embeddedViewInjector ?? null,
				r?.dehydratedView ?? null
			),
			u = e[t.index]
		c[Zn] = u
		let l = e[zt]
		return l !== null && (c[zt] = l.createEmbeddedView(o)), bf(o, c, n), c
	} finally {
		U(i)
	}
}
function md(e, t) {
	return !t || t.firstChild === null || ba(e)
}
var hA
function Cf(e, t) {
	return hA(e, t)
}
var Kt = (function (e) {
	return (
		(e[(e.Important = 1)] = 'Important'), (e[(e.DashCase = 2)] = 'DashCase'), e
	)
})(Kt || {})
function ui(e) {
	return (e.flags & 32) === 32
}
function Lr(e, t, n, r, i) {
	if (r != null) {
		let o,
			s = !1
		Ct(r) ? (o = r) : rt(r) && ((s = !0), (r = r[je]))
		let a = it(r)
		e === 0 && n !== null
			? i == null
				? wE(t, n, a)
				: Sa(t, n, a, i || null, !0)
			: e === 1 && n !== null
			? Sa(t, n, a, i || null, !0)
			: e === 2
			? vf(t, a, s)
			: e === 3 && t.destroyNode(a),
			o != null && CA(t, e, o, n, i)
	}
}
function pA(e, t) {
	OE(e, t), (t[je] = null), (t[st] = null)
}
function gA(e, t, n, r, i, o) {
	;(r[je] = i), (r[st] = t), ac(e, r, n, 1, i, o)
}
function OE(e, t) {
	t[Ht].changeDetectionScheduler?.notify(9), ac(e, t, t[Q], 2, null, null)
}
function mA(e) {
	let t = e[Ji]
	if (!t) return Ll(e[S], e)
	for (; t; ) {
		let n = null
		if (rt(t)) n = t[Ji]
		else {
			let r = t[ke]
			r && (n = r)
		}
		if (!n) {
			for (; t && !t[nt] && t !== e; ) rt(t) && Ll(t[S], t), (t = t[de])
			t === null && (t = e), rt(t) && Ll(t[S], t), (n = t && t[nt])
		}
		t = n
	}
}
function Tf(e, t) {
	let n = e[zr],
		r = n.indexOf(t)
	n.splice(r, 1)
}
function Sf(e, t) {
	if (Jr(t)) return
	let n = t[Q]
	n.destroyNode && ac(e, t, n, 3, null, null), mA(t)
}
function Ll(e, t) {
	if (Jr(t)) return
	let n = U(null)
	try {
		;(t[R] &= -129),
			(t[R] |= 256),
			t[We] && Qu(t[We]),
			yA(e, t),
			vA(e, t),
			t[S].type === 1 && t[Q].destroy()
		let r = t[Zn]
		if (r !== null && Ct(t[de])) {
			r !== t[de] && Tf(r, t)
			let i = t[zt]
			i !== null && i.detachView(e)
		}
		ld(t)
	} finally {
		U(n)
	}
}
function vA(e, t) {
	let n = e.cleanup,
		r = t[ga]
	if (n !== null)
		for (let s = 0; s < n.length - 1; s += 2)
			if (typeof n[s] == 'string') {
				let a = n[s + 3]
				a >= 0 ? r[a]() : r[-a].unsubscribe(), (s += 2)
			} else {
				let a = r[n[s + 1]]
				n[s].call(a)
			}
	r !== null && (t[ga] = null)
	let i = t[mn]
	if (i !== null) {
		t[mn] = null
		for (let s = 0; s < i.length; s++) {
			let a = i[s]
			a()
		}
	}
	let o = t[ma]
	if (o !== null) {
		t[ma] = null
		for (let s of o) s.destroy()
	}
}
function yA(e, t) {
	let n
	if (e != null && (n = e.destroyHooks) != null)
		for (let r = 0; r < n.length; r += 2) {
			let i = t[n[r]]
			if (!(i instanceof Xn)) {
				let o = n[r + 1]
				if (Array.isArray(o))
					for (let s = 0; s < o.length; s += 2) {
						let a = i[o[s]],
							c = o[s + 1]
						G(4, a, c)
						try {
							c.call(a)
						} finally {
							G(5, a, c)
						}
					}
				else {
					G(4, i, o)
					try {
						o.call(i)
					} finally {
						G(5, i, o)
					}
				}
			}
		}
}
function EA(e, t, n) {
	return _A(e, t.parent, n)
}
function _A(e, t, n) {
	let r = t
	for (; r !== null && r.type & 168; ) (t = r), (r = t.parent)
	if (r === null) return n[je]
	if (ir(r)) {
		let { encapsulation: i } = e.data[r.directiveStart + r.componentOffset]
		if (i === bt.None || i === bt.Emulated) return null
	}
	return at(r, n)
}
function IA(e, t, n) {
	return DA(e, t, n)
}
function wA(e, t, n) {
	return e.type & 40 ? at(e, n) : null
}
var DA = wA,
	sv
function sc(e, t, n, r) {
	let i = EA(e, r, t),
		o = t[Q],
		s = r.parent || t[st],
		a = IA(s, r, t)
	if (i != null)
		if (Array.isArray(n))
			for (let c = 0; c < n.length; c++) ov(o, i, n[c], a, !1)
		else ov(o, i, n, a, !1)
	sv !== void 0 && sv(o, r, t, n, i)
}
function Yi(e, t) {
	if (t !== null) {
		let n = t.type
		if (n & 3) return at(t, e)
		if (n & 4) return vd(-1, e[t.index])
		if (n & 8) {
			let r = t.child
			if (r !== null) return Yi(e, r)
			{
				let i = e[t.index]
				return Ct(i) ? vd(-1, i) : it(i)
			}
		} else {
			if (n & 128) return Yi(e, t.next)
			if (n & 32) return Cf(t, e)() || it(e[t.index])
			{
				let r = kE(e, t)
				if (r !== null) {
					if (Array.isArray(r)) return r[0]
					let i = Qn(e[Ge])
					return Yi(i, r)
				} else return Yi(e, t.next)
			}
		}
	}
	return null
}
function kE(e, t) {
	if (t !== null) {
		let r = e[Ge][st],
			i = t.projection
		return r.projection[i]
	}
	return null
}
function vd(e, t) {
	let n = ke + e + 1
	if (n < t.length) {
		let r = t[n],
			i = r[S].firstChild
		if (i !== null) return Yi(r, i)
	}
	return t[Gt]
}
function Af(e, t, n, r, i, o, s) {
	for (; n != null; ) {
		if (n.type === 128) {
			n = n.next
			continue
		}
		let a = r[n.index],
			c = n.type
		if ((s && t === 0 && (a && si(it(a), r), (n.flags |= 2)), !ui(n)))
			if (c & 8) Af(e, t, n.child, r, i, o, !1), Lr(t, e, i, a, o)
			else if (c & 32) {
				let u = Cf(n, r),
					l
				for (; (l = u()); ) Lr(t, e, i, l, o)
				Lr(t, e, i, a, o)
			} else c & 16 ? bA(e, t, r, n, i, o) : Lr(t, e, i, a, o)
		n = s ? n.projectionNext : n.next
	}
}
function ac(e, t, n, r, i, o) {
	Af(n, r, e.firstChild, t, i, o, !1)
}
function bA(e, t, n, r, i, o) {
	let s = n[Ge],
		c = s[st].projection[r.projection]
	if (Array.isArray(c))
		for (let u = 0; u < c.length; u++) {
			let l = c[u]
			Lr(t, e, i, l, o)
		}
	else {
		let u = c,
			l = s[de]
		ba(r) && (u.flags |= 128), Af(e, t, u, l, i, o, !0)
	}
}
function CA(e, t, n, r, i) {
	let o = n[Gt],
		s = it(n)
	o !== s && Lr(t, e, r, o, i)
	for (let a = ke; a < n.length; a++) {
		let c = n[a]
		ac(c[S], c, e, t, r, o)
	}
}
function TA(e, t, n, r, i) {
	if (t) i ? e.addClass(n, r) : e.removeClass(n, r)
	else {
		let o = r.indexOf('-') === -1 ? void 0 : Kt.DashCase
		i == null
			? e.removeStyle(n, r, o)
			: (typeof i == 'string' &&
					i.endsWith('!important') &&
					((i = i.slice(0, -10)), (o |= Kt.Important)),
			  e.setStyle(n, r, i, o))
	}
}
function Aa(e, t, n, r, i = !1) {
	for (; n !== null; ) {
		if (n.type === 128) {
			n = i ? n.projectionNext : n.next
			continue
		}
		let o = t[n.index]
		o !== null && r.push(it(o)), Ct(o) && SA(o, r)
		let s = n.type
		if (s & 8) Aa(e, t, n.child, r)
		else if (s & 32) {
			let a = Cf(n, t),
				c
			for (; (c = a()); ) r.push(c)
		} else if (s & 16) {
			let a = kE(t, n)
			if (Array.isArray(a)) r.push(...a)
			else {
				let c = Qn(t[Ge])
				Aa(c[S], c, a, r, !0)
			}
		}
		n = i ? n.projectionNext : n.next
	}
	return r
}
function SA(e, t) {
	for (let n = ke; n < e.length; n++) {
		let r = e[n],
			i = r[S].firstChild
		i !== null && Aa(r[S], r, i, t)
	}
	e[Gt] !== e[je] && t.push(e[Gt])
}
function xE(e) {
	if (e[jr] !== null) {
		for (let t of e[jr]) t.impl.addSequence(t)
		e[jr].length = 0
	}
}
var PE = []
function AA(e) {
	return e[We] ?? MA(e)
}
function MA(e) {
	let t = PE.pop() ?? Object.create(NA)
	return (t.lView = e), t
}
function RA(e) {
	e.lView[We] !== e && ((e.lView = null), PE.push(e))
}
var NA = L(y({}, $i), {
	consumerIsAlwaysLive: !0,
	kind: 'template',
	consumerMarkedDirty: (e) => {
		oo(e.lView)
	},
	consumerOnSignalRead() {
		this.lView[We] = this
	},
})
function OA(e) {
	let t = e[We] ?? Object.create(kA)
	return (t.lView = e), t
}
var kA = L(y({}, $i), {
	consumerIsAlwaysLive: !0,
	kind: 'template',
	consumerMarkedDirty: (e) => {
		let t = Qn(e.lView)
		for (; t && !FE(t[S]); ) t = Qn(t)
		t && uy(t)
	},
	consumerOnSignalRead() {
		this.lView[We] = this
	},
})
function FE(e) {
	return e.type !== 2
}
function LE(e) {
	if (e[ma] === null) return
	let t = !0
	for (; t; ) {
		let n = !1
		for (let r of e[ma])
			r.dirty &&
				((n = !0),
				r.zone === null || Zone.current === r.zone
					? r.run()
					: r.zone.run(() => r.run()))
		t = n && !!(e[R] & 8192)
	}
}
var xA = 100
function VE(e, t = !0, n = 0) {
	let i = e[Ht].rendererFactory,
		o = !1
	o || i.begin?.()
	try {
		PA(e, n)
	} catch (s) {
		throw (t && oc(e, s), s)
	} finally {
		o || i.end?.()
	}
}
function PA(e, t) {
	let n = gy()
	try {
		Bm(!0), yd(e, t)
		let r = 0
		for (; Wa(e); ) {
			if (r === xA) throw new w(103, !1)
			r++, yd(e, 1)
		}
	} finally {
		Bm(n)
	}
}
function FA(e, t, n, r) {
	if (Jr(t)) return
	let i = t[R],
		o = !1,
		s = !1
	Jd(t)
	let a = !0,
		c = null,
		u = null
	o ||
		(FE(e)
			? ((u = AA(t)), (c = vs(u)))
			: Ng() === null
			? ((a = !1), (u = OA(t)), (c = vs(u)))
			: t[We] && (Qu(t[We]), (t[We] = null)))
	try {
		cy(t), UT(e.bindingStartIndex), n !== null && AE(e, t, n, 2, r)
		let l = (i & 3) === 3
		if (!o)
			if (l) {
				let f = e.preOrderCheckHooks
				f !== null && ra(t, f, null)
			} else {
				let f = e.preOrderHooks
				f !== null && ia(t, f, 0, null), kl(t, 0)
			}
		if (
			(s || LA(t), LE(t), jE(t, 0), e.contentQueries !== null && pE(e, t), !o)
		)
			if (l) {
				let f = e.contentCheckHooks
				f !== null && ra(t, f)
			} else {
				let f = e.contentHooks
				f !== null && ia(t, f, 1), kl(t, 1)
			}
		jA(e, t)
		let d = e.components
		d !== null && BE(t, d, 0)
		let h = e.viewQuery
		if ((h !== null && pd(2, h, r), !o))
			if (l) {
				let f = e.viewCheckHooks
				f !== null && ra(t, f)
			} else {
				let f = e.viewHooks
				f !== null && ia(t, f, 2), kl(t, 2)
			}
		if ((e.firstUpdatePass === !0 && (e.firstUpdatePass = !1), t[Ol])) {
			for (let f of t[Ol]) f()
			t[Ol] = null
		}
		o || (xE(t), (t[R] &= -73))
	} catch (l) {
		throw (o || oo(t), l)
	} finally {
		u !== null && (Yu(u, c), a && RA(u)), Xd()
	}
}
function jE(e, t) {
	for (let n = Ky(e); n !== null; n = Yy(n))
		for (let r = ke; r < n.length; r++) {
			let i = n[r]
			UE(i, t)
		}
}
function LA(e) {
	for (let t = Ky(e); t !== null; t = Yy(t)) {
		if (!(t[R] & 2)) continue
		let n = t[zr]
		for (let r = 0; r < n.length; r++) {
			let i = n[r]
			uy(i)
		}
	}
}
function VA(e, t, n) {
	G(18)
	let r = Dt(t, e)
	UE(r, n), G(19, r[xe])
}
function UE(e, t) {
	Kd(e) && yd(e, t)
}
function yd(e, t) {
	let r = e[S],
		i = e[R],
		o = e[We],
		s = !!(t === 0 && i & 16)
	if (
		((s ||= !!(i & 64 && t === 0)),
		(s ||= !!(i & 1024)),
		(s ||= !!(o?.dirty && Zu(o))),
		(s ||= !1),
		o && (o.dirty = !1),
		(e[R] &= -9217),
		s)
	)
		FA(r, e, r.template, e[xe])
	else if (i & 8192) {
		LE(e), jE(e, 1)
		let a = r.components
		a !== null && BE(e, a, 1), xE(e)
	}
}
function BE(e, t, n) {
	for (let r = 0; r < t.length; r++) VA(e, t[r], n)
}
function jA(e, t) {
	let n = e.hostBindingOpCodes
	if (n !== null)
		try {
			for (let r = 0; r < n.length; r++) {
				let i = n[r]
				if (i < 0) Jn(~i)
				else {
					let o = i,
						s = n[++r],
						a = n[++r]
					HT(s, o)
					let c = t[o]
					G(24, c), a(2, c), G(25, c)
				}
			}
		} finally {
			Jn(-1)
		}
}
function cc(e, t) {
	let n = gy() ? 64 : 1088
	for (e[Ht].changeDetectionScheduler?.notify(t); e; ) {
		e[R] |= n
		let r = Qn(e)
		if (Xi(e) && !r) return e
		e = r
	}
	return null
}
function $E(e, t, n, r) {
	return [e, !0, 0, t, null, r, null, n, null, null]
}
function HE(e, t, n, r = !0) {
	let i = t[S]
	if ((BA(i, t, e, n), r)) {
		let s = vd(n, e),
			a = t[Q],
			c = a.parentNode(e[Gt])
		c !== null && gA(i, e[st], a, t, c, s)
	}
	let o = t[It]
	o !== null && o.firstChild !== null && (o.firstChild = null)
}
function UA(e, t) {
	let n = Ma(e, t)
	return n !== void 0 && Sf(n[S], n), n
}
function Ma(e, t) {
	if (e.length <= ke) return
	let n = ke + t,
		r = e[n]
	if (r) {
		let i = r[Zn]
		i !== null && i !== e && Tf(i, r), t > 0 && (e[n - 1][nt] = r[nt])
		let o = ha(e, ke + t)
		pA(r[S], r)
		let s = o[zt]
		s !== null && s.detachView(o[S]),
			(r[de] = null),
			(r[nt] = null),
			(r[R] &= -129)
	}
	return r
}
function BA(e, t, n, r) {
	let i = ke + r,
		o = n.length
	r > 0 && (n[i - 1][nt] = t),
		r < o - ke
			? ((t[nt] = n[i]), Hv(n, ke + r, t))
			: (n.push(t), (t[nt] = null)),
		(t[de] = n)
	let s = t[Zn]
	s !== null && n !== s && zE(s, t)
	let a = t[zt]
	a !== null && a.insertView(e), Xl(t), (t[R] |= 128)
}
function zE(e, t) {
	let n = e[zr],
		r = t[de]
	if (rt(r)) e[R] |= 2
	else {
		let i = r[de][Ge]
		t[Ge] !== i && (e[R] |= 2)
	}
	n === null ? (e[zr] = [t]) : n.push(t)
}
var to = class {
	_lView
	_cdRefInjectingView
	notifyErrorHandler
	_appRef = null
	_attachedToViewContainer = !1
	get rootNodes() {
		let t = this._lView,
			n = t[S]
		return Aa(n, t, n.firstChild, [])
	}
	constructor(t, n, r = !0) {
		;(this._lView = t),
			(this._cdRefInjectingView = n),
			(this.notifyErrorHandler = r)
	}
	get context() {
		return this._lView[xe]
	}
	set context(t) {
		this._lView[xe] = t
	}
	get destroyed() {
		return Jr(this._lView)
	}
	destroy() {
		if (this._appRef) this._appRef.detachView(this)
		else if (this._attachedToViewContainer) {
			let t = this._lView[de]
			if (Ct(t)) {
				let n = t[va],
					r = n ? n.indexOf(this) : -1
				r > -1 && (Ma(t, r), ha(n, r))
			}
			this._attachedToViewContainer = !1
		}
		Sf(this._lView[S], this._lView)
	}
	onDestroy(t) {
		ly(this._lView, t)
	}
	markForCheck() {
		cc(this._cdRefInjectingView || this._lView, 4)
	}
	detach() {
		this._lView[R] &= -129
	}
	reattach() {
		Xl(this._lView), (this._lView[R] |= 128)
	}
	detectChanges() {
		;(this._lView[R] |= 1024), VE(this._lView, this.notifyErrorHandler)
	}
	checkNoChanges() {}
	attachToViewContainerRef() {
		if (this._appRef) throw new w(902, !1)
		this._attachedToViewContainer = !0
	}
	detachFromAppRef() {
		this._appRef = null
		let t = Xi(this._lView),
			n = this._lView[Zn]
		n !== null && !t && Tf(n, this._lView), OE(this._lView[S], this._lView)
	}
	attachToAppRef(t) {
		if (this._attachedToViewContainer) throw new w(902, !1)
		this._appRef = t
		let n = Xi(this._lView),
			r = this._lView[Zn]
		r !== null && !n && zE(r, this._lView), Xl(this._lView)
	}
}
var nr = (() => {
		class e {
			static __NG_ELEMENT_ID__ = zA
		}
		return e
	})(),
	$A = nr,
	HA = class extends $A {
		_declarationLView
		_declarationTContainer
		elementRef
		constructor(t, n, r) {
			super(),
				(this._declarationLView = t),
				(this._declarationTContainer = n),
				(this.elementRef = r)
		}
		get ssrId() {
			return this._declarationTContainer.tView?.ssrId || null
		}
		createEmbeddedView(t, n) {
			return this.createEmbeddedViewImpl(t, n)
		}
		createEmbeddedViewImpl(t, n, r) {
			let i = NE(this._declarationLView, this._declarationTContainer, t, {
				embeddedViewInjector: n,
				dehydratedView: r,
			})
			return new to(i)
		}
	}
function zA() {
	return uc(be(), z())
}
function uc(e, t) {
	return e.type & 4 ? new HA(t, e, ii(e, t)) : null
}
function lc(e, t, n, r, i) {
	let o = e.data[t]
	if (o === null) (o = WA(e, t, n, r, i)), $T() && (o.flags |= 32)
	else if (o.type & 64) {
		;(o.type = n), (o.value = r), (o.attrs = i)
		let s = LT()
		o.injectorIndex = s === null ? -1 : s.injectorIndex
	}
	return sr(o, !0), o
}
function WA(e, t, n, r, i) {
	let o = hy(),
		s = Zd(),
		a = s ? o : o && o.parent,
		c = (e.data[t] = qA(e, a, n, t, r, i))
	return GA(e, c, o, s), c
}
function GA(e, t, n, r) {
	e.firstChild === null && (e.firstChild = t),
		n !== null &&
			(r
				? n.child == null && t.parent !== null && (n.child = t)
				: n.next === null && ((n.next = t), (t.prev = n)))
}
function qA(e, t, n, r, i, o) {
	let s = t ? t.injectorIndex : -1,
		a = 0
	return (
		so() && (a |= 128),
		{
			type: n,
			index: r,
			insertBeforeIndex: null,
			injectorIndex: s,
			directiveStart: -1,
			directiveEnd: -1,
			directiveStylingLast: -1,
			componentOffset: -1,
			propertyBindings: null,
			flags: a,
			providerIndexes: 0,
			value: i,
			attrs: o,
			mergedAttrs: null,
			localNames: null,
			initialInputs: null,
			inputs: null,
			hostDirectiveInputs: null,
			outputs: null,
			hostDirectiveOutputs: null,
			directiveToIndex: null,
			tView: null,
			next: null,
			prev: null,
			projectionNext: null,
			child: null,
			parent: t,
			projection: null,
			styles: null,
			stylesWithoutHost: null,
			residualStyles: void 0,
			classes: null,
			classesWithoutHost: null,
			residualClasses: void 0,
			classBindings: 0,
			styleBindings: 0,
		}
	)
}
var KA = new RegExp(`^(\\d+)*(${Xy}|${Jy})*(.*)`)
function YA(e) {
	let t = e.match(KA),
		[n, r, i, o] = t,
		s = r ? parseInt(r, 10) : i,
		a = []
	for (let [c, u, l] of o.matchAll(/(f|n)(\d*)/g)) {
		let d = parseInt(l, 10) || 1
		a.push(u, d)
	}
	return [s, ...a]
}
function ZA(e) {
	return !e.prev && e.parent?.type === 8
}
function Vl(e) {
	return e.index - te
}
function QA(e, t) {
	let n = e.i18nNodes
	if (n) return n.get(t)
}
function dc(e, t, n, r) {
	let i = Vl(r),
		o = QA(e, i)
	if (o === void 0) {
		let s = e.data[jS]
		if (s?.[i]) o = XA(s[i], n)
		else if (t.firstChild === r) o = e.firstChild
		else {
			let a = r.prev === null,
				c = r.prev ?? r.parent
			if (ZA(r)) {
				let u = Vl(r.parent)
				o = hd(e, u)
			} else {
				let u = at(c, n)
				if (a) o = u.firstChild
				else {
					let l = Vl(c),
						d = hd(e, l)
					if (c.type === 2 && d) {
						let f = ff(e, l) + 1
						o = fc(f, d)
					} else o = u.nextSibling
				}
			}
		}
	}
	return o
}
function fc(e, t) {
	let n = t
	for (let r = 0; r < e; r++) n = n.nextSibling
	return n
}
function JA(e, t) {
	let n = e
	for (let r = 0; r < t.length; r += 2) {
		let i = t[r],
			o = t[r + 1]
		for (let s = 0; s < o; s++)
			switch (i) {
				case xS:
					n = n.firstChild
					break
				case PS:
					n = n.nextSibling
					break
			}
	}
	return n
}
function XA(e, t) {
	let [n, ...r] = YA(e),
		i
	if (n === Jy) i = t[Ge][je]
	else if (n === Xy) i = x0(t[Ge][je])
	else {
		let o = Number(n)
		i = it(t[o + te])
	}
	return JA(i, r)
}
var eM = !1
function tM(e) {
	eM = e
}
function nM(e) {
	let t = e[It]
	if (t) {
		let { i18nNodes: n, dehydratedIcuData: r } = t
		if (n && r) {
			let i = e[Q]
			for (let o of r.values()) rM(i, n, o)
		}
		;(t.i18nNodes = void 0), (t.dehydratedIcuData = void 0)
	}
}
function rM(e, t, n) {
	for (let r of n.node.cases[n.case]) {
		let i = t.get(r.index - te)
		i && vf(e, i, !1)
	}
}
function WE(e) {
	let t = e[Wt] ?? [],
		r = e[de][Q],
		i = []
	for (let o of t) o.data[US] !== void 0 ? i.push(o) : GE(o, r)
	e[Wt] = i
}
function iM(e) {
	let { lContainer: t } = e,
		n = t[Wt]
	if (n === null) return
	let i = t[de][Q]
	for (let o of n) GE(o, i)
}
function GE(e, t) {
	let n = 0,
		r = e.firstChild
	if (r) {
		let i = e.data[Ca]
		for (; n < i; ) {
			let o = r.nextSibling
			vf(t, r, !1), (r = o), n++
		}
	}
}
function hc(e) {
	WE(e)
	let t = e[je]
	rt(t) && Ra(t)
	for (let n = ke; n < e.length; n++) Ra(e[n])
}
function Ra(e) {
	nM(e)
	let t = e[S]
	for (let n = te; n < t.bindingStartIndex; n++)
		if (Ct(e[n])) {
			let r = e[n]
			hc(r)
		} else rt(e[n]) && Ra(e[n])
}
function qE(e) {
	let t = e._views
	for (let n of t) {
		let r = v0(n)
		r !== null && r[je] !== null && (rt(r) ? Ra(r) : hc(r))
	}
}
function oM(e, t, n, r) {
	e !== null && (n.cleanup(t), hc(e.lContainer), qE(r))
}
function sM(e, t) {
	let n = []
	for (let r of t)
		for (let i = 0; i < (r[eE] ?? 1); i++) {
			let o = { data: r, firstChild: null }
			r[Ca] > 0 && ((o.firstChild = e), (e = fc(r[Ca], e))), n.push(o)
		}
	return [e, n]
}
var KE = () => null
function aM(e, t) {
	let n = e[Wt]
	return !t || n === null || n.length === 0
		? null
		: n[0].data[VS] === t
		? n.shift()
		: (WE(e), null)
}
function cM() {
	KE = aM
}
function av(e, t) {
	return KE(e, t)
}
var uM = class {},
	YE = class {},
	Ed = class {
		resolveComponentFactory(t) {
			throw Error(`No component factory found for ${Oe(t)}.`)
		}
	},
	pc = class {
		static NULL = new Ed()
	},
	_n = class {},
	Dn = (() => {
		class e {
			destroyNode = null
			static __NG_ELEMENT_ID__ = () => lM()
		}
		return e
	})()
function lM() {
	let e = z(),
		t = be(),
		n = Dt(t.index, e)
	return (rt(n) ? n : e)[Q]
}
var dM = (() => {
	class e {
		static ɵprov = _({ token: e, providedIn: 'root', factory: () => null })
	}
	return e
})()
function _d(e, t, n) {
	let r = n ? e.styles : null,
		i = n ? e.classes : null,
		o = 0
	if (t !== null)
		for (let s = 0; s < t.length; s++) {
			let a = t[s]
			if (typeof a == 'number') o = a
			else if (o == 1) i = Om(i, a)
			else if (o == 2) {
				let c = a,
					u = t[++s]
				r = Om(r, c + ': ' + u + ';')
			}
		}
	n ? (e.styles = r) : (e.stylesWithoutHost = r),
		n ? (e.classes = i) : (e.classesWithoutHost = i)
}
function M(e, t = F.Default) {
	let n = z()
	if (n === null) return I(e, t)
	let r = be()
	return ky(r, n, De(e), t)
}
function ZE() {
	let e = 'invalid'
	throw new Error(e)
}
function Mf(e, t, n, r, i) {
	let o = r === null ? null : { '': -1 },
		s = i(e, n)
	if (s !== null) {
		let a,
			c = null,
			u = null,
			l = hM(s)
		l === null ? (a = s) : ([a, c, u] = l), mM(e, t, n, a, o, c, u)
	}
	o !== null && r !== null && fM(n, r, o)
}
function fM(e, t, n) {
	let r = (e.localNames = [])
	for (let i = 0; i < t.length; i += 2) {
		let o = n[t[i + 1]]
		if (o == null) throw new w(-301, !1)
		r.push(t[i], o)
	}
}
function hM(e) {
	let t = null,
		n = !1
	for (let s = 0; s < e.length; s++) {
		let a = e[s]
		if ((s === 0 && wt(a) && (t = a), a.findHostDirectiveDefs !== null)) {
			n = !0
			break
		}
	}
	if (!n) return null
	let r = null,
		i = null,
		o = null
	for (let s of e)
		s.findHostDirectiveDefs !== null &&
			((r ??= []), (i ??= new Map()), (o ??= new Map()), pM(s, r, o, i)),
			s === t && ((r ??= []), r.push(s))
	return r !== null
		? (r.push(...(t === null ? e : e.slice(1))), [r, i, o])
		: null
}
function pM(e, t, n, r) {
	let i = t.length
	e.findHostDirectiveDefs(e, t, r), n.set(e, [i, t.length - 1])
}
function gM(e, t, n) {
	;(t.componentOffset = n), (e.components ??= []).push(t.index)
}
function mM(e, t, n, r, i, o, s) {
	let a = r.length,
		c = !1
	for (let h = 0; h < a; h++) {
		let f = r[h]
		!c && wt(f) && ((c = !0), gM(e, n, h)), rd(Ia(n, t), e, f.type)
	}
	wM(n, e.data.length, a)
	for (let h = 0; h < a; h++) {
		let f = r[h]
		f.providersResolver && f.providersResolver(f)
	}
	let u = !1,
		l = !1,
		d = TE(e, t, a, null)
	a > 0 && (n.directiveToIndex = new Map())
	for (let h = 0; h < a; h++) {
		let f = r[h]
		if (
			((n.mergedAttrs = Gr(n.mergedAttrs, f.hostAttrs)),
			yM(e, n, t, d, f),
			IM(d, f, i),
			s !== null && s.has(f))
		) {
			let [v, D] = s.get(f)
			n.directiveToIndex.set(f.type, [
				d,
				v + n.directiveStart,
				D + n.directiveStart,
			])
		} else (o === null || !o.has(f)) && n.directiveToIndex.set(f.type, d)
		f.contentQueries !== null && (n.flags |= 4),
			(f.hostBindings !== null || f.hostAttrs !== null || f.hostVars !== 0) &&
				(n.flags |= 64)
		let m = f.type.prototype
		!u &&
			(m.ngOnChanges || m.ngOnInit || m.ngDoCheck) &&
			((e.preOrderHooks ??= []).push(n.index), (u = !0)),
			!l &&
				(m.ngOnChanges || m.ngDoCheck) &&
				((e.preOrderCheckHooks ??= []).push(n.index), (l = !0)),
			d++
	}
	vM(e, n, o)
}
function vM(e, t, n) {
	for (let r = t.directiveStart; r < t.directiveEnd; r++) {
		let i = e.data[r]
		if (n === null || !n.has(i)) cv(0, t, i, r), cv(1, t, i, r), lv(t, r, !1)
		else {
			let o = n.get(i)
			uv(0, t, o, r), uv(1, t, o, r), lv(t, r, !0)
		}
	}
}
function cv(e, t, n, r) {
	let i = e === 0 ? n.inputs : n.outputs
	for (let o in i)
		if (i.hasOwnProperty(o)) {
			let s
			e === 0 ? (s = t.inputs ??= {}) : (s = t.outputs ??= {}),
				(s[o] ??= []),
				s[o].push(r),
				QE(t, o)
		}
}
function uv(e, t, n, r) {
	let i = e === 0 ? n.inputs : n.outputs
	for (let o in i)
		if (i.hasOwnProperty(o)) {
			let s = i[o],
				a
			e === 0
				? (a = t.hostDirectiveInputs ??= {})
				: (a = t.hostDirectiveOutputs ??= {}),
				(a[s] ??= []),
				a[s].push(r, o),
				QE(t, s)
		}
}
function QE(e, t) {
	t === 'class' ? (e.flags |= 8) : t === 'style' && (e.flags |= 16)
}
function lv(e, t, n) {
	let { attrs: r, inputs: i, hostDirectiveInputs: o } = e
	if (r === null || (!n && i === null) || (n && o === null) || gf(e)) {
		;(e.initialInputs ??= []), e.initialInputs.push(null)
		return
	}
	let s = null,
		a = 0
	for (; a < r.length; ) {
		let c = r[a]
		if (c === 0) {
			a += 4
			continue
		} else if (c === 5) {
			a += 2
			continue
		} else if (typeof c == 'number') break
		if (!n && i.hasOwnProperty(c)) {
			let u = i[c]
			for (let l of u)
				if (l === t) {
					;(s ??= []), s.push(c, r[a + 1])
					break
				}
		} else if (n && o.hasOwnProperty(c)) {
			let u = o[c]
			for (let l = 0; l < u.length; l += 2)
				if (u[l] === t) {
					;(s ??= []), s.push(u[l + 1], r[a + 1])
					break
				}
		}
		a += 2
	}
	;(e.initialInputs ??= []), e.initialInputs.push(s)
}
function yM(e, t, n, r, i) {
	e.data[r] = i
	let o = i.factory || (i.factory = Kn(i.type, !0)),
		s = new Xn(o, wt(i), M)
	;(e.blueprint[r] = s), (n[r] = s), EM(e, t, r, TE(e, n, i.hostVars, ar), i)
}
function EM(e, t, n, r, i) {
	let o = i.hostBindings
	if (o) {
		let s = e.hostBindingOpCodes
		s === null && (s = e.hostBindingOpCodes = [])
		let a = ~t.index
		_M(s) != a && s.push(a), s.push(n, r, o)
	}
}
function _M(e) {
	let t = e.length
	for (; t > 0; ) {
		let n = e[--t]
		if (typeof n == 'number' && n < 0) return n
	}
	return 0
}
function IM(e, t, n) {
	if (n) {
		if (t.exportAs)
			for (let r = 0; r < t.exportAs.length; r++) n[t.exportAs[r]] = e
		wt(t) && (n[''] = e)
	}
}
function wM(e, t, n) {
	;(e.flags |= 1),
		(e.directiveStart = t),
		(e.directiveEnd = t + n),
		(e.providerIndexes = t)
}
function JE(e, t, n, r, i, o, s, a) {
	let c = t.consts,
		u = Wr(c, s),
		l = lc(t, e, 2, r, u)
	return (
		o && Mf(t, n, l, Wr(c, a), i),
		(l.mergedAttrs = Gr(l.mergedAttrs, l.attrs)),
		l.attrs !== null && _d(l, l.attrs, !1),
		l.mergedAttrs !== null && _d(l, l.mergedAttrs, !0),
		t.queries !== null && t.queries.elementStart(t, l),
		l
	)
}
function XE(e, t) {
	tf(e, t), qd(t) && e.queries.elementEnd(t)
}
var Na = class extends pc {
	ngModule
	constructor(t) {
		super(), (this.ngModule = t)
	}
	resolveComponentFactory(t) {
		let n = yn(t)
		return new qr(n, this.ngModule)
	}
}
function DM(e) {
	return Object.keys(e).map((t) => {
		let [n, r, i] = e[t],
			o = { propName: n, templateName: t, isSignal: (r & rc.SignalBased) !== 0 }
		return i && (o.transform = i), o
	})
}
function bM(e) {
	return Object.keys(e).map((t) => ({ propName: e[t], templateName: t }))
}
function CM(e, t, n) {
	let r = t instanceof fe ? t : t?.injector
	return (
		r &&
			e.getStandaloneInjector !== null &&
			(r = e.getStandaloneInjector(r) || r),
		r ? new Br(n, r) : n
	)
}
function TM(e) {
	let t = e.get(_n, null)
	if (t === null) throw new w(407, !1)
	let n = e.get(dM, null),
		r = e.get(er, null)
	return { rendererFactory: t, sanitizer: n, changeDetectionScheduler: r }
}
function SM(e, t) {
	let n = (e.selectors[0][0] || 'div').toLowerCase()
	return mf(t, n, n === 'svg' ? oy : n === 'math' ? CT : null)
}
var qr = class extends YE {
		componentDef
		ngModule
		selector
		componentType
		ngContentSelectors
		isBoundToModule
		cachedInputs = null
		cachedOutputs = null
		get inputs() {
			return (
				(this.cachedInputs ??= DM(this.componentDef.inputs)), this.cachedInputs
			)
		}
		get outputs() {
			return (
				(this.cachedOutputs ??= bM(this.componentDef.outputs)),
				this.cachedOutputs
			)
		}
		constructor(t, n) {
			super(),
				(this.componentDef = t),
				(this.ngModule = n),
				(this.componentType = t.type),
				(this.selector = z0(t.selectors)),
				(this.ngContentSelectors = t.ngContentSelectors ?? []),
				(this.isBoundToModule = !!n)
		}
		create(t, n, r, i) {
			G(22)
			let o = U(null)
			try {
				let s = this.componentDef,
					a = r ? ['ng-version', '19.2.2'] : W0(this.componentDef.selectors[0]),
					c = yf(0, null, null, 1, 0, null, null, null, null, [a], null),
					u = CM(s, i || this.ngModule, t),
					l = TM(u),
					d = l.rendererFactory.createRenderer(null, s),
					h = r ? J0(d, r, s.encapsulation, u) : SM(s, d),
					f = Ef(
						null,
						c,
						null,
						512 | CE(s),
						null,
						null,
						l,
						d,
						u,
						null,
						fE(h, u, !0)
					)
				;(f[te] = h), Jd(f)
				let m = null
				try {
					let v = JE(te, c, f, '#host', () => [this.componentDef], !0, 0)
					h && (bE(d, h, v), si(h, f)),
						ic(c, f, v),
						hf(c, v, f),
						XE(c, v),
						n !== void 0 && AM(v, this.ngContentSelectors, n),
						(m = Dt(v.index, f)),
						(f[xe] = m[xe]),
						bf(c, f, null)
				} catch (v) {
					throw (m !== null && ld(m), ld(f), v)
				} finally {
					G(23), Xd()
				}
				return new Id(this.componentType, f)
			} finally {
				U(o)
			}
		}
	},
	Id = class extends uM {
		_rootLView
		instance
		hostView
		changeDetectorRef
		componentType
		location
		previousInputValues = null
		_tNode
		constructor(t, n) {
			super(),
				(this._rootLView = n),
				(this._tNode = za(n[S], te)),
				(this.location = ii(this._tNode, n)),
				(this.instance = Dt(this._tNode.index, n)[xe]),
				(this.hostView = this.changeDetectorRef = new to(n, void 0, !1)),
				(this.componentType = t)
		}
		setInput(t, n) {
			let r = this._tNode
			if (
				((this.previousInputValues ??= new Map()),
				this.previousInputValues.has(t) &&
					Object.is(this.previousInputValues.get(t), n))
			)
				return
			let i = this._rootLView,
				o = Df(r, i[S], i, t, n)
			this.previousInputValues.set(t, n)
			let s = Dt(r.index, i)
			cc(s, 1)
		}
		get injector() {
			return new qn(this._tNode, this._rootLView)
		}
		destroy() {
			this.hostView.destroy()
		}
		onDestroy(t) {
			this.hostView.onDestroy(t)
		}
	}
function AM(e, t, n) {
	let r = (e.projection = [])
	for (let i = 0; i < t.length; i++) {
		let o = n[i]
		r.push(o != null && o.length ? Array.from(o) : null)
	}
}
var bn = (() => {
	class e {
		static __NG_ELEMENT_ID__ = MM
	}
	return e
})()
function MM() {
	let e = be()
	return t_(e, z())
}
var RM = bn,
	e_ = class extends RM {
		_lContainer
		_hostTNode
		_hostLView
		constructor(t, n, r) {
			super(),
				(this._lContainer = t),
				(this._hostTNode = n),
				(this._hostLView = r)
		}
		get element() {
			return ii(this._hostTNode, this._hostLView)
		}
		get injector() {
			return new qn(this._hostTNode, this._hostLView)
		}
		get parentInjector() {
			let t = nf(this._hostTNode, this._hostLView)
			if (Sy(t)) {
				let n = Ea(t, this._hostLView),
					r = ya(t),
					i = n[S].data[r + 8]
				return new qn(i, n)
			} else return new qn(null, this._hostLView)
		}
		clear() {
			for (; this.length > 0; ) this.remove(this.length - 1)
		}
		get(t) {
			let n = dv(this._lContainer)
			return (n !== null && n[t]) || null
		}
		get length() {
			return this._lContainer.length - ke
		}
		createEmbeddedView(t, n, r) {
			let i, o
			typeof r == 'number'
				? (i = r)
				: r != null && ((i = r.index), (o = r.injector))
			let s = av(this._lContainer, t.ssrId),
				a = t.createEmbeddedViewImpl(n || {}, o, s)
			return this.insertImpl(a, i, md(this._hostTNode, s)), a
		}
		createComponent(t, n, r, i, o) {
			let s = t && !IT(t),
				a
			if (s) a = n
			else {
				let m = n || {}
				;(a = m.index),
					(r = m.injector),
					(i = m.projectableNodes),
					(o = m.environmentInjector || m.ngModuleRef)
			}
			let c = s ? t : new qr(yn(t)),
				u = r || this.parentInjector
			if (!o && c.ngModule == null) {
				let v = (s ? u : this.parentInjector).get(fe, null)
				v && (o = v)
			}
			let l = yn(c.componentType ?? {}),
				d = av(this._lContainer, l?.id ?? null),
				h = d?.firstChild ?? null,
				f = c.create(u, i, h, o)
			return this.insertImpl(f.hostView, a, md(this._hostTNode, d)), f
		}
		insert(t, n) {
			return this.insertImpl(t, n, !0)
		}
		insertImpl(t, n, r) {
			let i = t._lView
			if (ST(i)) {
				let a = this.indexOf(t)
				if (a !== -1) this.detach(a)
				else {
					let c = i[de],
						u = new e_(c, c[st], c[de])
					u.detach(u.indexOf(t))
				}
			}
			let o = this._adjustIndex(n),
				s = this._lContainer
			return HE(s, i, o, r), t.attachToViewContainerRef(), Hv(jl(s), o, t), t
		}
		move(t, n) {
			return this.insert(t, n)
		}
		indexOf(t) {
			let n = dv(this._lContainer)
			return n !== null ? n.indexOf(t) : -1
		}
		remove(t) {
			let n = this._adjustIndex(t, -1),
				r = Ma(this._lContainer, n)
			r && (ha(jl(this._lContainer), n), Sf(r[S], r))
		}
		detach(t) {
			let n = this._adjustIndex(t, -1),
				r = Ma(this._lContainer, n)
			return r && ha(jl(this._lContainer), n) != null ? new to(r) : null
		}
		_adjustIndex(t, n = 0) {
			return t ?? this.length + n
		}
	}
function dv(e) {
	return e[va]
}
function jl(e) {
	return e[va] || (e[va] = [])
}
function t_(e, t) {
	let n,
		r = t[e.index]
	return (
		Ct(r) ? (n = r) : ((n = $E(r, t, null, e)), (t[e.index] = n), _f(t, n)),
		n_(n, t, e, r),
		new e_(n, e, t)
	)
}
function NM(e, t) {
	let n = e[Q],
		r = n.createComment(''),
		i = at(t, e),
		o = n.parentNode(i)
	return Sa(n, o, r, n.nextSibling(i), !1), r
}
var n_ = r_,
	Rf = () => !1
function OM(e, t, n) {
	return Rf(e, t, n)
}
function r_(e, t, n, r) {
	if (e[Gt]) return
	let i
	n.type & 8 ? (i = it(r)) : (i = NM(t, n)), (e[Gt] = i)
}
function kM(e, t, n) {
	if (e[Gt] && e[Wt]) return !0
	let r = n[It],
		i = t.index - te
	if (!r || SS(t) || uo(r, i)) return !1
	let s = hd(r, i),
		a = r.data[uf]?.[i],
		[c, u] = sM(s, a)
	return (e[Gt] = c), (e[Wt] = u), !0
}
function xM(e, t, n, r) {
	Rf(e, n, t) || r_(e, t, n, r)
}
function PM() {
	;(n_ = xM), (Rf = kM)
}
var wd = class e {
		queryList
		matches = null
		constructor(t) {
			this.queryList = t
		}
		clone() {
			return new e(this.queryList)
		}
		setDirty() {
			this.queryList.setDirty()
		}
	},
	Dd = class e {
		queries
		constructor(t = []) {
			this.queries = t
		}
		createEmbeddedView(t) {
			let n = t.queries
			if (n !== null) {
				let r = t.contentQueries !== null ? t.contentQueries[0] : n.length,
					i = []
				for (let o = 0; o < r; o++) {
					let s = n.getByIndex(o),
						a = this.queries[s.indexInDeclarationView]
					i.push(a.clone())
				}
				return new e(i)
			}
			return null
		}
		insertView(t) {
			this.dirtyQueriesWithMatches(t)
		}
		detachView(t) {
			this.dirtyQueriesWithMatches(t)
		}
		finishViewCreation(t) {
			this.dirtyQueriesWithMatches(t)
		}
		dirtyQueriesWithMatches(t) {
			for (let n = 0; n < this.queries.length; n++)
				Nf(t, n).matches !== null && this.queries[n].setDirty()
		}
	},
	bd = class {
		flags
		read
		predicate
		constructor(t, n, r = null) {
			;(this.flags = n),
				(this.read = r),
				typeof t == 'string' ? (this.predicate = HM(t)) : (this.predicate = t)
		}
	},
	Cd = class e {
		queries
		constructor(t = []) {
			this.queries = t
		}
		elementStart(t, n) {
			for (let r = 0; r < this.queries.length; r++)
				this.queries[r].elementStart(t, n)
		}
		elementEnd(t) {
			for (let n = 0; n < this.queries.length; n++)
				this.queries[n].elementEnd(t)
		}
		embeddedTView(t) {
			let n = null
			for (let r = 0; r < this.length; r++) {
				let i = n !== null ? n.length : 0,
					o = this.getByIndex(r).embeddedTView(t, i)
				o &&
					((o.indexInDeclarationView = r), n !== null ? n.push(o) : (n = [o]))
			}
			return n !== null ? new e(n) : null
		}
		template(t, n) {
			for (let r = 0; r < this.queries.length; r++)
				this.queries[r].template(t, n)
		}
		getByIndex(t) {
			return this.queries[t]
		}
		get length() {
			return this.queries.length
		}
		track(t) {
			this.queries.push(t)
		}
	},
	Td = class e {
		metadata
		matches = null
		indexInDeclarationView = -1
		crossesNgTemplate = !1
		_declarationNodeIndex
		_appliesToNextNode = !0
		constructor(t, n = -1) {
			;(this.metadata = t), (this._declarationNodeIndex = n)
		}
		elementStart(t, n) {
			this.isApplyingToNode(n) && this.matchTNode(t, n)
		}
		elementEnd(t) {
			this._declarationNodeIndex === t.index && (this._appliesToNextNode = !1)
		}
		template(t, n) {
			this.elementStart(t, n)
		}
		embeddedTView(t, n) {
			return this.isApplyingToNode(t)
				? ((this.crossesNgTemplate = !0),
				  this.addMatch(-t.index, n),
				  new e(this.metadata))
				: null
		}
		isApplyingToNode(t) {
			if (this._appliesToNextNode && (this.metadata.flags & 1) !== 1) {
				let n = this._declarationNodeIndex,
					r = t.parent
				for (; r !== null && r.type & 8 && r.index !== n; ) r = r.parent
				return n === (r !== null ? r.index : -1)
			}
			return this._appliesToNextNode
		}
		matchTNode(t, n) {
			let r = this.metadata.predicate
			if (Array.isArray(r))
				for (let i = 0; i < r.length; i++) {
					let o = r[i]
					this.matchTNodeWithReadOption(t, n, FM(n, o)),
						this.matchTNodeWithReadOption(t, n, oa(n, t, o, !1, !1))
				}
			else
				r === nr
					? n.type & 4 && this.matchTNodeWithReadOption(t, n, -1)
					: this.matchTNodeWithReadOption(t, n, oa(n, t, r, !1, !1))
		}
		matchTNodeWithReadOption(t, n, r) {
			if (r !== null) {
				let i = this.metadata.read
				if (i !== null)
					if (i === Ye || i === bn || (i === nr && n.type & 4))
						this.addMatch(n.index, -2)
					else {
						let o = oa(n, t, i, !1, !1)
						o !== null && this.addMatch(n.index, o)
					}
				else this.addMatch(n.index, r)
			}
		}
		addMatch(t, n) {
			this.matches === null ? (this.matches = [t, n]) : this.matches.push(t, n)
		}
	}
function FM(e, t) {
	let n = e.localNames
	if (n !== null) {
		for (let r = 0; r < n.length; r += 2) if (n[r] === t) return n[r + 1]
	}
	return null
}
function LM(e, t) {
	return e.type & 11 ? ii(e, t) : e.type & 4 ? uc(e, t) : null
}
function VM(e, t, n, r) {
	return n === -1 ? LM(t, e) : n === -2 ? jM(e, t, r) : eo(e, e[S], n, t)
}
function jM(e, t, n) {
	if (n === Ye) return ii(t, e)
	if (n === nr) return uc(t, e)
	if (n === bn) return t_(t, e)
}
function i_(e, t, n, r) {
	let i = t[zt].queries[r]
	if (i.matches === null) {
		let o = e.data,
			s = n.matches,
			a = []
		for (let c = 0; s !== null && c < s.length; c += 2) {
			let u = s[c]
			if (u < 0) a.push(null)
			else {
				let l = o[u]
				a.push(VM(t, l, s[c + 1], n.metadata.read))
			}
		}
		i.matches = a
	}
	return i.matches
}
function Sd(e, t, n, r) {
	let i = e.queries.getByIndex(n),
		o = i.matches
	if (o !== null) {
		let s = i_(e, t, i, n)
		for (let a = 0; a < o.length; a += 2) {
			let c = o[a]
			if (c > 0) r.push(s[a / 2])
			else {
				let u = o[a + 1],
					l = t[-c]
				for (let d = ke; d < l.length; d++) {
					let h = l[d]
					h[Zn] === h[de] && Sd(h[S], h, u, r)
				}
				if (l[zr] !== null) {
					let d = l[zr]
					for (let h = 0; h < d.length; h++) {
						let f = d[h]
						Sd(f[S], f, u, r)
					}
				}
			}
		}
	}
	return r
}
function UM(e, t) {
	return e[zt].queries[t].queryList
}
function BM(e, t, n) {
	let r = new ud((n & 4) === 4)
	return (
		RT(e, t, r, r.destroy), (t[zt] ??= new Dd()).queries.push(new wd(r)) - 1
	)
}
function $M(e, t, n) {
	let r = pe()
	return (
		r.firstCreatePass &&
			(zM(r, new bd(e, t, n), -1), (t & 2) === 2 && (r.staticViewQueries = !0)),
		BM(r, z(), t)
	)
}
function HM(e) {
	return e.split(',').map((t) => t.trim())
}
function zM(e, t, n) {
	e.queries === null && (e.queries = new Cd()), e.queries.track(new Td(t, n))
}
function Nf(e, t) {
	return e.queries.getByIndex(t)
}
function WM(e, t) {
	let n = e[S],
		r = Nf(n, t)
	return r.crossesNgTemplate ? Sd(n, e, t, []) : i_(n, e, r, t)
}
var Kr = class {},
	Of = class {}
var Ad = class extends Kr {
		ngModuleType
		_parent
		_bootstrapComponents = []
		_r3Injector
		instance
		destroyCbs = []
		componentFactoryResolver = new Na(this)
		constructor(t, n, r, i = !0) {
			super(), (this.ngModuleType = t), (this._parent = n)
			let o = Gv(t)
			;(this._bootstrapComponents = yE(o.bootstrap)),
				(this._r3Injector = Fy(
					t,
					n,
					[
						{ provide: Kr, useValue: this },
						{ provide: pc, useValue: this.componentFactoryResolver },
						...r,
					],
					Oe(t),
					new Set(['environment'])
				)),
				i && this.resolveInjectorInitializers()
		}
		resolveInjectorInitializers() {
			this._r3Injector.resolveInjectorInitializers(),
				(this.instance = this._r3Injector.get(this.ngModuleType))
		}
		get injector() {
			return this._r3Injector
		}
		destroy() {
			let t = this._r3Injector
			!t.destroyed && t.destroy(),
				this.destroyCbs.forEach((n) => n()),
				(this.destroyCbs = null)
		}
		onDestroy(t) {
			this.destroyCbs.push(t)
		}
	},
	Md = class extends Of {
		moduleType
		constructor(t) {
			super(), (this.moduleType = t)
		}
		create(t) {
			return new Ad(this.moduleType, t, [])
		}
	}
var Oa = class extends Kr {
	injector
	componentFactoryResolver = new Na(this)
	instance = null
	constructor(t) {
		super()
		let n = new Qi(
			[
				...t.providers,
				{ provide: Kr, useValue: this },
				{ provide: pc, useValue: this.componentFactoryResolver },
			],
			t.parent || Gd(),
			t.debugName,
			new Set(['environment'])
		)
		;(this.injector = n),
			t.runEnvironmentInitializers && n.resolveInjectorInitializers()
	}
	destroy() {
		this.injector.destroy()
	}
	onDestroy(t) {
		this.injector.onDestroy(t)
	}
}
function fo(e, t, n = null) {
	return new Oa({
		providers: e,
		parent: t,
		debugName: n,
		runEnvironmentInitializers: !0,
	}).injector
}
var GM = (() => {
	class e {
		_injector
		cachedInjectors = new Map()
		constructor(n) {
			this._injector = n
		}
		getOrCreateStandaloneInjector(n) {
			if (!n.standalone) return null
			if (!this.cachedInjectors.has(n)) {
				let r = zd(!1, n.type),
					i =
						r.length > 0
							? fo([r], this._injector, `Standalone[${n.type.name}]`)
							: null
				this.cachedInjectors.set(n, i)
			}
			return this.cachedInjectors.get(n)
		}
		ngOnDestroy() {
			try {
				for (let n of this.cachedInjectors.values()) n !== null && n.destroy()
			} finally {
				this.cachedInjectors.clear()
			}
		}
		static ɵprov = _({
			token: e,
			providedIn: 'environment',
			factory: () => new e(I(fe)),
		})
	}
	return e
})()
function Tt(e) {
	return ro(() => {
		let t = s_(e),
			n = L(y({}, t), {
				decls: e.decls,
				vars: e.vars,
				template: e.template,
				consts: e.consts || null,
				ngContentSelectors: e.ngContentSelectors,
				onPush: e.changeDetection === Gy.OnPush,
				directiveDefs: null,
				pipeDefs: null,
				dependencies: (t.standalone && e.dependencies) || null,
				getStandaloneInjector: t.standalone
					? (i) => i.get(GM).getOrCreateStandaloneInjector(n)
					: null,
				getExternalStyles: null,
				signals: e.signals ?? !1,
				data: e.data || {},
				encapsulation: e.encapsulation || bt.Emulated,
				styles: e.styles || ze,
				_: null,
				schemas: e.schemas || null,
				tView: null,
				id: '',
			})
		t.standalone && wn('NgStandalone'), a_(n)
		let r = e.dependencies
		return (
			(n.directiveDefs = fv(r, !1)), (n.pipeDefs = fv(r, !0)), (n.id = QM(n)), n
		)
	})
}
function qM(e) {
	return yn(e) || qv(e)
}
function KM(e) {
	return e !== null
}
function ct(e) {
	return ro(() => ({
		type: e.type,
		bootstrap: e.bootstrap || ze,
		declarations: e.declarations || ze,
		imports: e.imports || ze,
		exports: e.exports || ze,
		transitiveCompileScopes: null,
		schemas: e.schemas || null,
		id: e.id || null,
	}))
}
function YM(e, t) {
	if (e == null) return Yn
	let n = {}
	for (let r in e)
		if (e.hasOwnProperty(r)) {
			let i = e[r],
				o,
				s,
				a,
				c
			Array.isArray(i)
				? ((a = i[0]), (o = i[1]), (s = i[2] ?? o), (c = i[3] || null))
				: ((o = i), (s = i), (a = rc.None), (c = null)),
				(n[o] = [r, a, c]),
				(t[o] = s)
		}
	return n
}
function ZM(e) {
	if (e == null) return Yn
	let t = {}
	for (let n in e) e.hasOwnProperty(n) && (t[e[n]] = n)
	return t
}
function Ce(e) {
	return ro(() => {
		let t = s_(e)
		return a_(t), t
	})
}
function o_(e) {
	return {
		type: e.type,
		name: e.name,
		factory: null,
		pure: e.pure !== !1,
		standalone: e.standalone ?? !0,
		onDestroy: e.type.prototype.ngOnDestroy || null,
	}
}
function s_(e) {
	let t = {}
	return {
		type: e.type,
		providersResolver: null,
		factory: null,
		hostBindings: e.hostBindings || null,
		hostVars: e.hostVars || 0,
		hostAttrs: e.hostAttrs || null,
		contentQueries: e.contentQueries || null,
		declaredInputs: t,
		inputConfig: e.inputs || Yn,
		exportAs: e.exportAs || null,
		standalone: e.standalone ?? !0,
		signals: e.signals === !0,
		selectors: e.selectors || ze,
		viewQuery: e.viewQuery || null,
		features: e.features || null,
		setInput: null,
		findHostDirectiveDefs: null,
		hostDirectives: null,
		inputs: YM(e.inputs, t),
		outputs: ZM(e.outputs),
		debugInfo: null,
	}
}
function a_(e) {
	e.features?.forEach((t) => t(e))
}
function fv(e, t) {
	if (!e) return null
	let n = t ? Kv : qM
	return () => (typeof e == 'function' ? e() : e).map((r) => n(r)).filter(KM)
}
function QM(e) {
	let t = 0,
		n = typeof e.consts == 'function' ? '' : e.consts,
		r = [
			e.selectors,
			e.ngContentSelectors,
			e.hostVars,
			e.hostAttrs,
			n,
			e.vars,
			e.decls,
			e.encapsulation,
			e.standalone,
			e.signals,
			e.exportAs,
			JSON.stringify(e.inputs),
			JSON.stringify(e.outputs),
			Object.getOwnPropertyNames(e.type.prototype),
			!!e.contentQueries,
			!!e.viewQuery,
		]
	for (let o of r.join('|')) t = (Math.imul(31, t) + o.charCodeAt(0)) << 0
	return (t += 2147483648), 'c' + t
}
function JM(e) {
	return Object.getPrototypeOf(e.prototype).constructor
}
function cr(e) {
	let t = JM(e.type),
		n = !0,
		r = [e]
	for (; t; ) {
		let i
		if (wt(e)) i = t.ɵcmp || t.ɵdir
		else {
			if (t.ɵcmp) throw new w(903, !1)
			i = t.ɵdir
		}
		if (i) {
			if (n) {
				r.push(i)
				let s = e
				;(s.inputs = Ul(e.inputs)),
					(s.declaredInputs = Ul(e.declaredInputs)),
					(s.outputs = Ul(e.outputs))
				let a = i.hostBindings
				a && rR(e, a)
				let c = i.viewQuery,
					u = i.contentQueries
				if (
					(c && tR(e, c),
					u && nR(e, u),
					XM(e, i),
					HC(e.outputs, i.outputs),
					wt(i) && i.data.animation)
				) {
					let l = e.data
					l.animation = (l.animation || []).concat(i.data.animation)
				}
			}
			let o = i.features
			if (o)
				for (let s = 0; s < o.length; s++) {
					let a = o[s]
					a && a.ngInherit && a(e), a === cr && (n = !1)
				}
		}
		t = Object.getPrototypeOf(t)
	}
	eR(r)
}
function XM(e, t) {
	for (let n in t.inputs) {
		if (!t.inputs.hasOwnProperty(n) || e.inputs.hasOwnProperty(n)) continue
		let r = t.inputs[n]
		r !== void 0 &&
			((e.inputs[n] = r), (e.declaredInputs[n] = t.declaredInputs[n]))
	}
}
function eR(e) {
	let t = 0,
		n = null
	for (let r = e.length - 1; r >= 0; r--) {
		let i = e[r]
		;(i.hostVars = t += i.hostVars),
			(i.hostAttrs = Gr(i.hostAttrs, (n = Gr(n, i.hostAttrs))))
	}
}
function Ul(e) {
	return e === Yn ? {} : e === ze ? [] : e
}
function tR(e, t) {
	let n = e.viewQuery
	n
		? (e.viewQuery = (r, i) => {
				t(r, i), n(r, i)
		  })
		: (e.viewQuery = t)
}
function nR(e, t) {
	let n = e.contentQueries
	n
		? (e.contentQueries = (r, i, o) => {
				t(r, i, o), n(r, i, o)
		  })
		: (e.contentQueries = t)
}
function rR(e, t) {
	let n = e.hostBindings
	n
		? (e.hostBindings = (r, i) => {
				t(r, i), n(r, i)
		  })
		: (e.hostBindings = t)
}
function c_(e) {
	return oR(e)
		? Array.isArray(e) || (!(e instanceof Map) && Symbol.iterator in e)
		: !1
}
function iR(e, t) {
	if (Array.isArray(e)) for (let n = 0; n < e.length; n++) t(e[n])
	else {
		let n = e[Symbol.iterator](),
			r
		for (; !(r = n.next()).done; ) t(r.value)
	}
}
function oR(e) {
	return e !== null && (typeof e == 'function' || typeof e == 'object')
}
function sR(e, t, n) {
	return (e[t] = n)
}
function li(e, t, n) {
	let r = e[t]
	return Object.is(r, n) ? !1 : ((e[t] = n), !0)
}
function aR(e, t, n, r, i, o, s, a, c) {
	let u = t.consts,
		l = lc(t, e, 4, s || null, a || null)
	Yd() && Mf(t, n, l, Wr(u, c), wf),
		(l.mergedAttrs = Gr(l.mergedAttrs, l.attrs)),
		tf(t, l)
	let d = (l.tView = yf(
		2,
		l,
		r,
		i,
		o,
		t.directiveRegistry,
		t.pipeRegistry,
		null,
		t.schemas,
		u,
		null
	))
	return (
		t.queries !== null &&
			(t.queries.template(t, l), (d.queries = t.queries.embeddedTView(l))),
		l
	)
}
function cR(e, t, n, r, i, o, s, a, c, u) {
	let l = n + te,
		d = t.firstCreatePass ? aR(l, t, e, r, i, o, s, a, c) : t.data[l]
	sr(d, !1)
	let h = u_(t, e, d, n)
	qa() && sc(t, e, h, d), si(h, e)
	let f = $E(h, e, h, d)
	return (
		(e[l] = f),
		_f(e, f),
		OM(f, d, e),
		Ha(d) && ic(t, e, d),
		c != null && If(e, d, u),
		d
	)
}
function Qt(e, t, n, r, i, o, s, a) {
	let c = z(),
		u = pe(),
		l = Wr(u.consts, o)
	return cR(c, u, e, t, n, r, i, l, s, a), Qt
}
var u_ = l_
function l_(e, t, n, r) {
	return In(!0), t[Q].createComment('')
}
function uR(e, t, n, r) {
	let i = t[It],
		o = !i || so() || ui(n) || uo(i, r)
	if ((In(o), o)) return l_(e, t)
	let s = i.data[LS]?.[r] ?? null
	s !== null &&
		n.tView !== null &&
		n.tView.ssrId === null &&
		(n.tView.ssrId = s)
	let a = dc(i, e, t, n)
	tc(i, r, a)
	let c = ff(i, r)
	return fc(c, a)
}
function lR() {
	u_ = uR
}
var dR = (() => {
	class e {
		cachedInjectors = new Map()
		getOrCreateInjector(n, r, i, o) {
			if (!this.cachedInjectors.has(n)) {
				let s = i.length > 0 ? fo(i, r, o) : null
				this.cachedInjectors.set(n, s)
			}
			return this.cachedInjectors.get(n)
		}
		ngOnDestroy() {
			try {
				for (let n of this.cachedInjectors.values()) n !== null && n.destroy()
			} finally {
				this.cachedInjectors.clear()
			}
		}
		static ɵprov = _({
			token: e,
			providedIn: 'environment',
			factory: () => new e(),
		})
	}
	return e
})()
var fR = new E('')
function Bl(e, t, n) {
	return e.get(dR).getOrCreateInjector(t, e, n, '')
}
function hR(e, t, n) {
	if (e instanceof Br) {
		let i = e.injector,
			o = e.parentInjector,
			s = Bl(o, t, n)
		return new Br(i, s)
	}
	let r = e.get(fe)
	if (r !== e) {
		let i = Bl(r, t, n)
		return new Br(e, i)
	}
	return Bl(e, t, n)
}
function Vr(e, t, n, r = !1) {
	let i = n[de],
		o = i[S]
	if (Jr(i)) return
	let s = co(i, t),
		a = s[Ja],
		c = s[e0]
	if (!(c !== null && e < c) && hv(a, e) && hv(s[QS] ?? -1, e)) {
		let u = Xa(o, t),
			d =
				!r &&
				!0 &&
				(o0(u) !== null || tv(u, le.Loading) !== null || tv(u, le.Placeholder))
					? mR
					: gR
		try {
			d(e, s, n, t, i)
		} catch (h) {
			oc(i, h)
		}
	}
}
function pR(e, t) {
	let n = e[Wt]?.findIndex((i) => i.data[BS] === t[Ja]) ?? -1
	return { dehydratedView: n > -1 ? e[Wt][n] : null, dehydratedViewIx: n }
}
function gR(e, t, n, r, i) {
	G(20)
	let o = i0(e, i, r)
	if (o !== null) {
		t[Ja] = e
		let s = i[S],
			a = o + te,
			c = za(s, a),
			u = 0
		UA(n, u)
		let l
		if (e === le.Complete) {
			let m = Xa(s, r),
				v = m.providers
			v && v.length > 0 && (l = hR(i[En], m, v))
		}
		let { dehydratedView: d, dehydratedViewIx: h } = pR(n, t),
			f = NE(i, c, null, { injector: l, dehydratedView: d })
		if (
			(HE(n, f, u, md(c, d)),
			cc(f, 2),
			h > -1 && n[Wt]?.splice(h, 1),
			(e === le.Complete || e === le.Error) && Array.isArray(t[$r]))
		) {
			for (let m of t[$r]) m()
			t[$r] = null
		}
	}
	G(21)
}
function hv(e, t) {
	return e < t
}
function pv(e, t, n) {
	e.loadingPromise.then(() => {
		e.loadingState === Ve.COMPLETE
			? Vr(le.Complete, t, n)
			: e.loadingState === Ve.FAILED && Vr(le.Error, t, n)
	})
}
var mR = null
var kf = (() => {
	class e {
		log(n) {
			console.log(n)
		}
		warn(n) {
			console.warn(n)
		}
		static ɵfac = function (r) {
			return new (r || e)()
		}
		static ɵprov = _({ token: e, factory: e.ɵfac, providedIn: 'platform' })
	}
	return e
})()
var xf = new E(''),
	ho = new E(''),
	gc = (() => {
		class e {
			_ngZone
			registry
			_isZoneStable = !0
			_callbacks = []
			taskTrackingZone = null
			constructor(n, r, i) {
				;(this._ngZone = n),
					(this.registry = r),
					Pf || (vR(i), i.addToWindow(r)),
					this._watchAngularEvents(),
					n.run(() => {
						this.taskTrackingZone =
							typeof Zone > 'u' ? null : Zone.current.get('TaskTrackingZone')
					})
			}
			_watchAngularEvents() {
				this._ngZone.onUnstable.subscribe({
					next: () => {
						this._isZoneStable = !1
					},
				}),
					this._ngZone.runOutsideAngular(() => {
						this._ngZone.onStable.subscribe({
							next: () => {
								j.assertNotInAngularZone(),
									queueMicrotask(() => {
										;(this._isZoneStable = !0), this._runCallbacksIfReady()
									})
							},
						})
					})
			}
			isStable() {
				return this._isZoneStable && !this._ngZone.hasPendingMacrotasks
			}
			_runCallbacksIfReady() {
				if (this.isStable())
					queueMicrotask(() => {
						for (; this._callbacks.length !== 0; ) {
							let n = this._callbacks.pop()
							clearTimeout(n.timeoutId), n.doneCb()
						}
					})
				else {
					let n = this.getPendingTasks()
					this._callbacks = this._callbacks.filter((r) =>
						r.updateCb && r.updateCb(n) ? (clearTimeout(r.timeoutId), !1) : !0
					)
				}
			}
			getPendingTasks() {
				return this.taskTrackingZone
					? this.taskTrackingZone.macroTasks.map((n) => ({
							source: n.source,
							creationLocation: n.creationLocation,
							data: n.data,
					  }))
					: []
			}
			addCallback(n, r, i) {
				let o = -1
				r &&
					r > 0 &&
					(o = setTimeout(() => {
						;(this._callbacks = this._callbacks.filter(
							(s) => s.timeoutId !== o
						)),
							n()
					}, r)),
					this._callbacks.push({ doneCb: n, timeoutId: o, updateCb: i })
			}
			whenStable(n, r, i) {
				if (i && !this.taskTrackingZone)
					throw new Error(
						'Task tracking zone is required when passing an update callback to whenStable(). Is "zone.js/plugins/task-tracking" loaded?'
					)
				this.addCallback(n, r, i), this._runCallbacksIfReady()
			}
			registerApplication(n) {
				this.registry.registerApplication(n, this)
			}
			unregisterApplication(n) {
				this.registry.unregisterApplication(n)
			}
			findProviders(n, r, i) {
				return []
			}
			static ɵfac = function (r) {
				return new (r || e)(I(j), I(mc), I(ho))
			}
			static ɵprov = _({ token: e, factory: e.ɵfac })
		}
		return e
	})(),
	mc = (() => {
		class e {
			_applications = new Map()
			registerApplication(n, r) {
				this._applications.set(n, r)
			}
			unregisterApplication(n) {
				this._applications.delete(n)
			}
			unregisterAllApplications() {
				this._applications.clear()
			}
			getTestability(n) {
				return this._applications.get(n) || null
			}
			getAllTestabilities() {
				return Array.from(this._applications.values())
			}
			getAllRootElements() {
				return Array.from(this._applications.keys())
			}
			findTestabilityInTree(n, r = !0) {
				return Pf?.findTestabilityInTree(this, n, r) ?? null
			}
			static ɵfac = function (r) {
				return new (r || e)()
			}
			static ɵprov = _({ token: e, factory: e.ɵfac, providedIn: 'platform' })
		}
		return e
	})()
function vR(e) {
	Pf = e
}
var Pf,
	yR = (() => {
		class e {
			static ɵprov = _({
				token: e,
				providedIn: 'root',
				factory: () => new Rd(),
			})
		}
		return e
	})(),
	Rd = class {
		queuedEffectCount = 0
		queues = new Map()
		schedule(t) {
			this.enqueue(t)
		}
		remove(t) {
			let n = t.zone,
				r = this.queues.get(n)
			r.has(t) && (r.delete(t), this.queuedEffectCount--)
		}
		enqueue(t) {
			let n = t.zone
			this.queues.has(n) || this.queues.set(n, new Set())
			let r = this.queues.get(n)
			r.has(t) || (this.queuedEffectCount++, r.add(t))
		}
		flush() {
			for (; this.queuedEffectCount > 0; )
				for (let [t, n] of this.queues)
					t === null ? this.flushQueue(n) : t.run(() => this.flushQueue(n))
		}
		flushQueue(t) {
			for (let n of t) t.delete(n), this.queuedEffectCount--, n.run()
		}
	}
function Cn(e) {
	return !!e && typeof e.then == 'function'
}
function Ff(e) {
	return !!e && typeof e.subscribe == 'function'
}
var vc = new E('')
var d_ = (() => {
		class e {
			resolve
			reject
			initialized = !1
			done = !1
			donePromise = new Promise((n, r) => {
				;(this.resolve = n), (this.reject = r)
			})
			appInits = g(vc, { optional: !0 }) ?? []
			injector = g(ae)
			constructor() {}
			runInitializers() {
				if (this.initialized) return
				let n = []
				for (let i of this.appInits) {
					let o = he(this.injector, i)
					if (Cn(o)) n.push(o)
					else if (Ff(o)) {
						let s = new Promise((a, c) => {
							o.subscribe({ complete: a, error: c })
						})
						n.push(s)
					}
				}
				let r = () => {
					;(this.done = !0), this.resolve()
				}
				Promise.all(n)
					.then(() => {
						r()
					})
					.catch((i) => {
						this.reject(i)
					}),
					n.length === 0 && r(),
					(this.initialized = !0)
			}
			static ɵfac = function (r) {
				return new (r || e)()
			}
			static ɵprov = _({ token: e, factory: e.ɵfac, providedIn: 'root' })
		}
		return e
	})(),
	Tn = new E('')
function ER() {
	Bg(() => {
		throw new w(600, !1)
	})
}
function _R(e) {
	return e.isBoundToModule
}
var IR = 10
var ve = (() => {
	class e {
		_runningTick = !1
		_destroyed = !1
		_destroyListeners = []
		_views = []
		internalErrorHandler = g(yS)
		afterRenderManager = g(sE)
		zonelessEnabled = g(Ka)
		rootEffectScheduler = g(yR)
		dirtyFlags = 0
		tracingSnapshot = null
		externalTestViews = new Set()
		afterTick = new ie()
		get allViews() {
			return [...this.externalTestViews.keys(), ...this._views]
		}
		get destroyed() {
			return this._destroyed
		}
		componentTypes = []
		components = []
		isStable = g(Ke).hasPendingTasks.pipe(k((n) => !n))
		constructor() {
			g(ci, { optional: !0 })
		}
		whenStable() {
			let n
			return new Promise((r) => {
				n = this.isStable.subscribe({
					next: (i) => {
						i && r()
					},
				})
			}).finally(() => {
				n.unsubscribe()
			})
		}
		_injector = g(fe)
		_rendererFactory = null
		get injector() {
			return this._injector
		}
		bootstrap(n, r) {
			G(10)
			let i = n instanceof YE
			if (!this._injector.get(d_).done) {
				let h = ''
				throw new w(405, h)
			}
			let s
			i ? (s = n) : (s = this._injector.get(pc).resolveComponentFactory(n)),
				this.componentTypes.push(s.componentType)
			let a = _R(s) ? void 0 : this._injector.get(Kr),
				c = r || s.selector,
				u = s.create(ae.NULL, [], c, a),
				l = u.location.nativeElement,
				d = u.injector.get(xf, null)
			return (
				d?.registerApplication(l),
				u.onDestroy(() => {
					this.detachView(u.hostView),
						aa(this.components, u),
						d?.unregisterApplication(l)
				}),
				this._loadComponent(u),
				G(11, u),
				u
			)
		}
		tick() {
			this.zonelessEnabled || (this.dirtyFlags |= 1), this._tick()
		}
		_tick() {
			G(12),
				this.tracingSnapshot !== null
					? this.tracingSnapshot.run(lf.CHANGE_DETECTION, this.tickImpl)
					: this.tickImpl()
		}
		tickImpl = () => {
			if (this._runningTick) throw new w(101, !1)
			let n = U(null)
			try {
				;(this._runningTick = !0), this.synchronize()
			} catch (r) {
				this.internalErrorHandler(r)
			} finally {
				;(this._runningTick = !1),
					this.tracingSnapshot?.dispose(),
					(this.tracingSnapshot = null),
					U(n),
					this.afterTick.next(),
					G(13)
			}
		}
		synchronize() {
			this._rendererFactory === null &&
				!this._injector.destroyed &&
				(this._rendererFactory = this._injector.get(_n, null, { optional: !0 }))
			let n = 0
			for (; this.dirtyFlags !== 0 && n++ < IR; )
				G(14), this.synchronizeOnce(), G(15)
		}
		synchronizeOnce() {
			if (
				(this.dirtyFlags & 16 &&
					((this.dirtyFlags &= -17), this.rootEffectScheduler.flush()),
				this.dirtyFlags & 7)
			) {
				let n = !!(this.dirtyFlags & 1)
				;(this.dirtyFlags &= -8), (this.dirtyFlags |= 8)
				for (let { _lView: r, notifyErrorHandler: i } of this.allViews)
					wR(r, i, n, this.zonelessEnabled)
				if (
					((this.dirtyFlags &= -5),
					this.syncDirtyFlagsWithViews(),
					this.dirtyFlags & 23)
				)
					return
			} else this._rendererFactory?.begin?.(), this._rendererFactory?.end?.()
			this.dirtyFlags & 8 &&
				((this.dirtyFlags &= -9), this.afterRenderManager.execute()),
				this.syncDirtyFlagsWithViews()
		}
		syncDirtyFlagsWithViews() {
			if (this.allViews.some(({ _lView: n }) => Wa(n))) {
				this.dirtyFlags |= 2
				return
			} else this.dirtyFlags &= -8
		}
		attachView(n) {
			let r = n
			this._views.push(r), r.attachToAppRef(this)
		}
		detachView(n) {
			let r = n
			aa(this._views, r), r.detachFromAppRef()
		}
		_loadComponent(n) {
			this.attachView(n.hostView),
				this.tick(),
				this.components.push(n),
				this._injector.get(Tn, []).forEach((i) => i(n))
		}
		ngOnDestroy() {
			if (!this._destroyed)
				try {
					this._destroyListeners.forEach((n) => n()),
						this._views.slice().forEach((n) => n.destroy())
				} finally {
					;(this._destroyed = !0),
						(this._views = []),
						(this._destroyListeners = [])
				}
		}
		onDestroy(n) {
			return this._destroyListeners.push(n), () => aa(this._destroyListeners, n)
		}
		destroy() {
			if (this._destroyed) throw new w(406, !1)
			let n = this._injector
			n.destroy && !n.destroyed && n.destroy()
		}
		get viewCount() {
			return this._views.length
		}
		static ɵfac = function (r) {
			return new (r || e)()
		}
		static ɵprov = _({ token: e, factory: e.ɵfac, providedIn: 'root' })
	}
	return e
})()
function aa(e, t) {
	let n = e.indexOf(t)
	n > -1 && e.splice(n, 1)
}
function wR(e, t, n, r) {
	if (!n && !Wa(e)) return
	VE(e, t, n && !r ? 0 : 1)
}
function DR(e, t, n) {
	let r = t[En],
		i = t[S]
	if (e.loadingState !== Ve.NOT_STARTED)
		return e.loadingPromise ?? Promise.resolve()
	let o = co(t, n),
		s = s0(i, e)
	;(e.loadingState = Ve.IN_PROGRESS), sa(1, o)
	let a = e.dependencyResolverFn,
		c = r.get(Ke),
		u = c.add()
	return a
		? ((e.loadingPromise = Promise.allSettled(a()).then((l) => {
				let d = !1,
					h = [],
					f = []
				for (let m of l)
					if (m.status === 'fulfilled') {
						let v = m.value,
							D = yn(v) || qv(v)
						if (D) h.push(D)
						else {
							let T = Kv(v)
							T && f.push(T)
						}
					} else {
						d = !0
						break
					}
				if (((e.loadingPromise = null), c.remove(u), d)) {
					if (((e.loadingState = Ve.FAILED), e.errorTmplIndex === null)) {
						let m = '',
							v = new w(-750, !1)
						oc(t, v)
					}
				} else {
					e.loadingState = Ve.COMPLETE
					let m = s.tView
					if (h.length > 0) {
						m.directiveRegistry = nv(m.directiveRegistry, h)
						let v = h.map((T) => T.type),
							D = zd(!1, ...v)
						e.providers = D
					}
					f.length > 0 && (m.pipeRegistry = nv(m.pipeRegistry, f))
				}
		  })),
		  e.loadingPromise)
		: ((e.loadingPromise = Promise.resolve().then(() => {
				;(e.loadingPromise = null), (e.loadingState = Ve.COMPLETE), c.remove(u)
		  })),
		  e.loadingPromise)
}
function bR(e, t) {
	return t[En].get(fR, null, { optional: !0 })?.behavior !== aE.Manual
}
function CR(e, t, n) {
	let r = t[S],
		i = t[n.index]
	if (!bR(e, t)) return
	let o = co(t, n),
		s = Xa(r, n)
	switch ((n0(o), s.loadingState)) {
		case Ve.NOT_STARTED:
			Vr(le.Loading, n, i),
				DR(s, t, n),
				s.loadingState === Ve.IN_PROGRESS && pv(s, n, i)
			break
		case Ve.IN_PROGRESS:
			Vr(le.Loading, n, i), pv(s, n, i)
			break
		case Ve.COMPLETE:
			Vr(le.Complete, n, i)
			break
		case Ve.FAILED:
			Vr(le.Error, n, i)
			break
		default:
	}
}
function TR(e, t, n) {
	return p(this, null, function* () {
		let r = e.get(df)
		if (r.hydrating.has(t)) return
		let { parentBlockPromise: o, hydrationQueue: s } = D0(t, e)
		if (s.length === 0) return
		o !== null && s.shift(), MR(r, s), o !== null && (yield o)
		let a = s[0]
		r.has(a)
			? yield gv(e, s, n)
			: r.awaitParentBlock(a, () =>
					p(this, null, function* () {
						return yield gv(e, s, n)
					})
			  )
	})
}
function gv(e, t, n) {
	return p(this, null, function* () {
		let r = e.get(df),
			i = r.hydrating,
			o = e.get(Ke),
			s = o.add()
		for (let c = 0; c < t.length; c++) {
			let u = t[c],
				l = r.get(u)
			if (l != null) {
				if ((yield NR(l), yield RR(e), SR(l))) {
					iM(l), mv(t.slice(c), r)
					break
				}
				i.get(u).resolve()
			} else {
				AR(c, t, r), mv(t.slice(c), r)
				break
			}
		}
		let a = t[t.length - 1]
		yield i.get(a)?.promise,
			o.remove(s),
			n && n(t),
			oM(r.get(a), t, r, e.get(ve))
	})
}
function SR(e) {
	return co(e.lView, e.tNode)[Ja] === le.Error
}
function AR(e, t, n) {
	let r = e - 1,
		i = r > -1 ? n.get(t[r]) : null
	i && hc(i.lContainer)
}
function mv(e, t) {
	let n = t.hydrating
	for (let r in e) n.get(r)?.reject()
	t.cleanup(e)
}
function MR(e, t) {
	for (let n of t) e.hydrating.set(n, Promise.withResolvers())
}
function RR(e) {
	return new Promise((t) => Qa(t, { injector: e }))
}
function NR(e) {
	return p(this, null, function* () {
		let { tNode: t, lView: n } = e,
			r = co(n, t)
		return new Promise((i) => {
			OR(r, i), CR(2, n, t)
		})
	})
}
function OR(e, t) {
	Array.isArray(e[$r]) || (e[$r] = []), e[$r].push(t)
}
function po(e, t, n, r) {
	let i = z(),
		o = Ga()
	if (li(i, o, t)) {
		let s = pe(),
			a = ef()
		aA(a, i, e, t, n, r)
	}
	return po
}
function kR(e, t, n, r) {
	return li(e, Ga(), n) ? t + Va(n) + r : ar
}
function ea(e, t) {
	return (e << 17) | (t << 2)
}
function rr(e) {
	return (e >> 17) & 32767
}
function xR(e) {
	return (e & 2) == 2
}
function PR(e, t) {
	return (e & 131071) | (t << 17)
}
function Nd(e) {
	return e | 2
}
function Yr(e) {
	return (e & 131068) >> 2
}
function $l(e, t) {
	return (e & -131069) | (t << 2)
}
function FR(e) {
	return (e & 1) === 1
}
function Od(e) {
	return e | 1
}
function LR(e, t, n, r, i, o) {
	let s = o ? t.classBindings : t.styleBindings,
		a = rr(s),
		c = Yr(s)
	e[r] = n
	let u = !1,
		l
	if (Array.isArray(n)) {
		let d = n
		;(l = d[1]), (l === null || io(d, l) > 0) && (u = !0)
	} else l = n
	if (i)
		if (c !== 0) {
			let h = rr(e[a + 1])
			;(e[r + 1] = ea(h, a)),
				h !== 0 && (e[h + 1] = $l(e[h + 1], r)),
				(e[a + 1] = PR(e[a + 1], r))
		} else
			(e[r + 1] = ea(a, 0)), a !== 0 && (e[a + 1] = $l(e[a + 1], r)), (a = r)
	else
		(e[r + 1] = ea(c, 0)),
			a === 0 ? (a = r) : (e[c + 1] = $l(e[c + 1], r)),
			(c = r)
	u && (e[r + 1] = Nd(e[r + 1])),
		vv(e, l, r, !0),
		vv(e, l, r, !1),
		VR(t, l, e, r, o),
		(s = ea(a, c)),
		o ? (t.classBindings = s) : (t.styleBindings = s)
}
function VR(e, t, n, r, i) {
	let o = i ? e.residualClasses : e.residualStyles
	o != null &&
		typeof t == 'string' &&
		io(o, t) >= 0 &&
		(n[r + 1] = Od(n[r + 1]))
}
function vv(e, t, n, r) {
	let i = e[n + 1],
		o = t === null,
		s = r ? rr(i) : Yr(i),
		a = !1
	for (; s !== 0 && (a === !1 || o); ) {
		let c = e[s],
			u = e[s + 1]
		jR(c, t) && ((a = !0), (e[s + 1] = r ? Od(u) : Nd(u))),
			(s = r ? rr(u) : Yr(u))
	}
	a && (e[n + 1] = r ? Nd(i) : Od(i))
}
function jR(e, t) {
	return e === null || t == null || (Array.isArray(e) ? e[1] : e) === t
		? !0
		: Array.isArray(e) && typeof t == 'string'
		? io(e, t) >= 0
		: !1
}
function Pe(e, t, n) {
	let r = z(),
		i = Ga()
	if (li(r, i, t)) {
		let o = pe(),
			s = ef()
		RE(o, s, r, e, t, r[Q], n, !1)
	}
	return Pe
}
function yv(e, t, n, r, i) {
	Df(t, e, n, i ? 'class' : 'style', r)
}
function Lf(e, t) {
	return UR(e, t, null, !0), Lf
}
function UR(e, t, n, r) {
	let i = z(),
		o = pe(),
		s = BT(2)
	if ((o.firstUpdatePass && $R(o, e, s, r), t !== ar && li(i, s, t))) {
		let a = o.data[ti()]
		qR(o, a, i, i[Q], e, (i[s + 1] = KR(t, n)), r, s)
	}
}
function BR(e, t) {
	return t >= e.expandoStartIndex
}
function $R(e, t, n, r) {
	let i = e.data
	if (i[n + 1] === null) {
		let o = i[ti()],
			s = BR(e, n)
		YR(o, r) && t === null && !s && (t = !1),
			(t = HR(i, o, t, r)),
			LR(i, o, t, n, s, r)
	}
}
function HR(e, t, n, r) {
	let i = WT(e),
		o = r ? t.residualClasses : t.residualStyles
	if (i === null)
		(r ? t.classBindings : t.styleBindings) === 0 &&
			((n = Hl(null, e, t, n, r)), (n = no(n, t.attrs, r)), (o = null))
	else {
		let s = t.directiveStylingLast
		if (s === -1 || e[s] !== i)
			if (((n = Hl(i, e, t, n, r)), o === null)) {
				let c = zR(e, t, r)
				c !== void 0 &&
					Array.isArray(c) &&
					((c = Hl(null, e, t, c[1], r)),
					(c = no(c, t.attrs, r)),
					WR(e, t, r, c))
			} else o = GR(e, t, r)
	}
	return (
		o !== void 0 && (r ? (t.residualClasses = o) : (t.residualStyles = o)), n
	)
}
function zR(e, t, n) {
	let r = n ? t.classBindings : t.styleBindings
	if (Yr(r) !== 0) return e[rr(r)]
}
function WR(e, t, n, r) {
	let i = n ? t.classBindings : t.styleBindings
	e[rr(i)] = r
}
function GR(e, t, n) {
	let r,
		i = t.directiveEnd
	for (let o = 1 + t.directiveStylingLast; o < i; o++) {
		let s = e[o].hostAttrs
		r = no(r, s, n)
	}
	return no(r, t.attrs, n)
}
function Hl(e, t, n, r, i) {
	let o = null,
		s = n.directiveEnd,
		a = n.directiveStylingLast
	for (
		a === -1 ? (a = n.directiveStart) : a++;
		a < s && ((o = t[a]), (r = no(r, o.hostAttrs, i)), o !== e);

	)
		a++
	return e !== null && (n.directiveStylingLast = a), r
}
function no(e, t, n) {
	let r = n ? 1 : 2,
		i = -1
	if (t !== null)
		for (let o = 0; o < t.length; o++) {
			let s = t[o]
			typeof s == 'number'
				? (i = s)
				: i === r &&
				  (Array.isArray(e) || (e = e === void 0 ? [] : ['', e]),
				  lT(e, s, n ? !0 : t[++o]))
		}
	return e === void 0 ? null : e
}
function qR(e, t, n, r, i, o, s, a) {
	if (!(t.type & 3)) return
	let c = e.data,
		u = c[a + 1],
		l = FR(u) ? Ev(c, t, n, i, Yr(u), s) : void 0
	if (!ka(l)) {
		ka(o) || (xR(u) && (o = Ev(c, null, n, i, a, s)))
		let d = sy(ti(), n)
		TA(r, s, d, i, o)
	}
}
function Ev(e, t, n, r, i, o) {
	let s = t === null,
		a
	for (; i > 0; ) {
		let c = e[i],
			u = Array.isArray(c),
			l = u ? c[1] : c,
			d = l === null,
			h = n[i + 1]
		h === ar && (h = d ? ze : void 0)
		let f = d ? Rl(h, r) : l === r ? h : void 0
		if ((u && !ka(f) && (f = Rl(c, r)), ka(f) && ((a = f), s))) return a
		let m = e[i + 1]
		i = s ? rr(m) : Yr(m)
	}
	if (t !== null) {
		let c = o ? t.residualClasses : t.residualStyles
		c != null && (a = Rl(c, r))
	}
	return a
}
function ka(e) {
	return e !== void 0
}
function KR(e, t) {
	return (
		e == null ||
			e === '' ||
			(typeof t == 'string'
				? (e = e + t)
				: typeof e == 'object' && (e = Oe(lo(e)))),
		e
	)
}
function YR(e, t) {
	return (e.flags & (t ? 8 : 16)) !== 0
}
function $(e, t, n, r) {
	let i = z(),
		o = pe(),
		s = te + e,
		a = i[Q],
		c = o.firstCreatePass ? JE(s, o, i, t, wf, Yd(), n, r) : o.data[s],
		u = f_(o, i, c, a, t, e)
	i[s] = u
	let l = Ha(c)
	return (
		sr(c, !0),
		bE(a, u, c),
		!ui(c) && qa() && sc(o, i, u, c),
		(NT() === 0 || l) && si(u, i),
		OT(),
		l && (ic(o, i, c), hf(o, c, i)),
		r !== null && If(i, c),
		$
	)
}
function H() {
	let e = be()
	Zd() ? py() : ((e = e.parent), sr(e, !1))
	let t = e
	xT(t) && FT(), kT()
	let n = pe()
	return (
		n.firstCreatePass && XE(n, t),
		t.classesWithoutHost != null &&
			QT(t) &&
			yv(n, t, z(), t.classesWithoutHost, !0),
		t.stylesWithoutHost != null &&
			JT(t) &&
			yv(n, t, z(), t.stylesWithoutHost, !1),
		H
	)
}
function Ze(e, t, n, r) {
	return $(e, t, n, r), H(), Ze
}
var f_ = (e, t, n, r, i, o) => (In(!0), mf(r, i, Dy()))
function ZR(e, t, n, r, i, o) {
	let s = t[It],
		a = !s || so() || ui(n) || uo(s, o)
	if ((In(a), a)) return mf(r, i, Dy())
	let c = dc(s, e, t, n)
	return (
		hE(s, o) && tc(s, o, c.nextSibling),
		s && (zy(n) || Wy(c)) && ir(n) && (PT(n), DE(c)),
		c
	)
}
function QR() {
	f_ = ZR
}
function JR(e, t, n, r, i) {
	let o = t.consts,
		s = Wr(o, r),
		a = lc(t, e, 8, 'ng-container', s)
	s !== null && _d(a, s, !0)
	let c = Wr(o, i)
	return (
		Yd() && Mf(t, n, a, c, wf),
		(a.mergedAttrs = Gr(a.mergedAttrs, a.attrs)),
		t.queries !== null && t.queries.elementStart(t, a),
		a
	)
}
function Vf(e, t, n) {
	let r = z(),
		i = pe(),
		o = e + te,
		s = i.firstCreatePass ? JR(o, i, r, t, n) : i.data[o]
	sr(s, !0)
	let a = h_(i, r, s, e)
	return (
		(r[o] = a),
		qa() && sc(i, r, a, s),
		si(a, r),
		Ha(s) && (ic(i, r, s), hf(i, s, r)),
		n != null && If(r, s),
		Vf
	)
}
function jf() {
	let e = be(),
		t = pe()
	return (
		Zd() ? py() : ((e = e.parent), sr(e, !1)),
		t.firstCreatePass && (tf(t, e), qd(e) && t.queries.elementEnd(e)),
		jf
	)
}
var h_ = (e, t, n, r) => (In(!0), IE(t[Q], ''))
function XR(e, t, n, r) {
	let i,
		o = t[It],
		s = !o || so() || uo(o, r) || ui(n)
	if ((In(s), s)) return IE(t[Q], '')
	let a = dc(o, e, t, n),
		c = I0(o, r)
	return tc(o, r, a), (i = fc(c, a)), i
}
function eN() {
	h_ = XR
}
function yc() {
	return z()
}
var xa = 'en-US'
var tN = xa
function nN(e) {
	typeof e == 'string' && (tN = e.toLowerCase().replace(/_/g, '-'))
}
var p_ = (e, t, n) => {}
function _v(e) {
	p_ = e
}
function Ue(e, t, n, r) {
	let i = z(),
		o = pe(),
		s = be()
	return g_(o, i, i[Q], s, e, t, r), Ue
}
function rN(e, t, n, r) {
	let i = e.cleanup
	if (i != null)
		for (let o = 0; o < i.length - 1; o += 2) {
			let s = i[o]
			if (s === n && i[o + 1] === r) {
				let a = t[ga],
					c = i[o + 2]
				return a.length > c ? a[c] : null
			}
			typeof s == 'string' && (o += 2)
		}
	return null
}
function g_(e, t, n, r, i, o, s) {
	let a = Ha(r),
		u = e.firstCreatePass ? fy(e) : null,
		l = t[xe],
		d = dy(t),
		h = !0
	if (r.type & 3 || s) {
		let f = at(r, t),
			m = s ? s(f) : f,
			v = d.length,
			D = s ? (ce) => s(it(ce[r.index])) : r.index,
			T = null
		if ((!s && a && (T = rN(e, t, i, r.index)), T !== null)) {
			let ce = T.__ngLastListenerFn__ || T
			;(ce.__ngNextListenerFn__ = o), (T.__ngLastListenerFn__ = o), (h = !1)
		} else {
			;(o = Dv(r, t, l, o)), p_(m, i, o)
			let ce = n.listen(m, i, o)
			d.push(o, ce), u && u.push(i, D, v, v + 1)
		}
	} else o = Dv(r, t, l, o)
	if (h) {
		let f = r.outputs?.[i],
			m = r.hostDirectiveOutputs?.[i]
		if (m && m.length)
			for (let v = 0; v < m.length; v += 2) {
				let D = m[v],
					T = m[v + 1]
				Iv(r, e, t, D, T, i, o, d, u)
			}
		if (f && f.length) for (let v of f) Iv(r, e, t, v, i, i, o, d, u)
	}
}
function Iv(e, t, n, r, i, o, s, a, c) {
	let u = n[r],
		d = t.data[r].outputs[i],
		f = u[d].subscribe(s),
		m = a.length
	a.push(s, f), c && c.push(o, e.index, m, -(m + 1))
}
function wv(e, t, n, r) {
	let i = U(null)
	try {
		return G(6, t, n), n(r) !== !1
	} catch (o) {
		return oc(e, o), !1
	} finally {
		G(7, t, n), U(i)
	}
}
function Dv(e, t, n, r) {
	return function i(o) {
		if (o === Function) return r
		let s = ir(e) ? Dt(e.index, t) : t
		cc(s, 5)
		let a = wv(t, n, r, o),
			c = i.__ngNextListenerFn__
		for (; c; ) (a = wv(t, n, c, o) && a), (c = c.__ngNextListenerFn__)
		return a
	}
}
function Ec(e = 1) {
	return qT(e)
}
function m_(e, t, n) {
	$M(e, t, n)
}
function Uf(e) {
	let t = z(),
		n = pe(),
		r = my()
	Qd(r + 1)
	let i = Nf(n, r)
	if (e.dirty && TT(t) === ((i.metadata.flags & 2) === 2)) {
		if (i.matches === null) e.reset([])
		else {
			let o = WM(t, r)
			e.reset(o, IS), e.notifyOnChanges()
		}
		return !0
	}
	return !1
}
function Bf() {
	return UM(z(), my())
}
function iN(e, t, n, r) {
	n >= e.data.length && ((e.data[n] = null), (e.blueprint[n] = null)),
		(t[n] = r)
}
function v_(e) {
	let t = VT()
	return ay(t, te + e)
}
function re(e, t = '') {
	let n = z(),
		r = pe(),
		i = e + te,
		o = r.firstCreatePass ? lc(r, i, 1, t, null) : r.data[i],
		s = y_(r, n, o, t, e)
	;(n[i] = s), qa() && sc(r, n, s, o), sr(o, !1)
}
var y_ = (e, t, n, r, i) => (In(!0), _E(t[Q], r))
function oN(e, t, n, r, i) {
	let o = t[It],
		s = !o || so() || ui(n) || uo(o, i)
	return In(s), s ? _E(t[Q], r) : dc(o, e, t, n)
}
function sN() {
	y_ = oN
}
function Sn(e) {
	return di('', e, ''), Sn
}
function di(e, t, n) {
	let r = z(),
		i = kR(r, e, t, n)
	return i !== ar && aN(r, ti(), i), di
}
function aN(e, t, n) {
	let r = sy(t, e)
	G0(e[Q], r, n)
}
function go(e, t, n) {
	Hy(t) && (t = t())
	let r = z(),
		i = Ga()
	if (li(r, i, t)) {
		let o = pe(),
			s = ef()
		RE(o, s, r, e, t, r[Q], n, !1)
	}
	return go
}
function _c(e, t) {
	let n = Hy(e)
	return n && e.set(t), n
}
function mo(e, t) {
	let n = z(),
		r = pe(),
		i = be()
	return g_(r, n, n[Q], i, e, t), mo
}
function cN(e, t, n) {
	let r = pe()
	if (r.firstCreatePass) {
		let i = wt(e)
		kd(n, r.data, r.blueprint, i, !0), kd(t, r.data, r.blueprint, i, !1)
	}
}
function kd(e, t, n, r, i) {
	if (((e = De(e)), Array.isArray(e)))
		for (let o = 0; o < e.length; o++) kd(e[o], t, n, r, i)
	else {
		let o = pe(),
			s = z(),
			a = be(),
			c = Hr(e) ? e : De(e.provide),
			u = Qv(e),
			l = a.providerIndexes & 1048575,
			d = a.directiveStart,
			h = a.providerIndexes >> 20
		if (Hr(e) || !e.multi) {
			let f = new Xn(u, i, M),
				m = Wl(c, t, i ? l : l + h, d)
			m === -1
				? (rd(Ia(a, s), o, c),
				  zl(o, e, t.length),
				  t.push(c),
				  a.directiveStart++,
				  a.directiveEnd++,
				  i && (a.providerIndexes += 1048576),
				  n.push(f),
				  s.push(f))
				: ((n[m] = f), (s[m] = f))
		} else {
			let f = Wl(c, t, l + h, d),
				m = Wl(c, t, l, l + h),
				v = f >= 0 && n[f],
				D = m >= 0 && n[m]
			if ((i && !D) || (!i && !v)) {
				rd(Ia(a, s), o, c)
				let T = dN(i ? lN : uN, n.length, i, r, u)
				!i && D && (n[m].providerFactory = T),
					zl(o, e, t.length, 0),
					t.push(c),
					a.directiveStart++,
					a.directiveEnd++,
					i && (a.providerIndexes += 1048576),
					n.push(T),
					s.push(T)
			} else {
				let T = E_(n[i ? m : f], u, !i && r)
				zl(o, e, f > -1 ? f : m, T)
			}
			!i && r && D && n[m].componentProviders++
		}
	}
}
function zl(e, t, n, r) {
	let i = Hr(t),
		o = gT(t)
	if (i || o) {
		let c = (o ? De(t.useClass) : t).prototype.ngOnDestroy
		if (c) {
			let u = e.destroyHooks || (e.destroyHooks = [])
			if (!i && t.multi) {
				let l = u.indexOf(n)
				l === -1 ? u.push(n, [r, c]) : u[l + 1].push(r, c)
			} else u.push(n, c)
		}
	}
}
function E_(e, t, n) {
	return n && e.componentProviders++, e.multi.push(t) - 1
}
function Wl(e, t, n, r) {
	for (let i = n; i < r; i++) if (t[i] === e) return i
	return -1
}
function uN(e, t, n, r) {
	return xd(this.multi, [])
}
function lN(e, t, n, r) {
	let i = this.multi,
		o
	if (this.providerFactory) {
		let s = this.providerFactory.componentProviders,
			a = eo(n, n[S], this.providerFactory.index, r)
		;(o = a.slice(0, s)), xd(i, o)
		for (let c = s; c < a.length; c++) o.push(a[c])
	} else (o = []), xd(i, o)
	return o
}
function xd(e, t) {
	for (let n = 0; n < e.length; n++) {
		let r = e[n]
		t.push(r())
	}
	return t
}
function dN(e, t, n, r, i) {
	let o = new Xn(e, n, M)
	return (
		(o.multi = []),
		(o.index = t),
		(o.componentProviders = 0),
		E_(o, i, r && !n),
		o
	)
}
function Ic(e, t = []) {
	return (n) => {
		n.providersResolver = (r, i) => cN(r, i ? i(e) : e, t)
	}
}
function fN(e, t) {
	let n = e[t]
	return n === ar ? void 0 : n
}
function hN(e, t, n, r, i, o) {
	let s = t + n
	return li(e, s, i) ? sR(e, s + 1, o ? r.call(o, i) : r(i)) : fN(e, s + 1)
}
function __(e, t) {
	let n = pe(),
		r,
		i = e + te
	n.firstCreatePass
		? ((r = pN(t, n.pipeRegistry)),
		  (n.data[i] = r),
		  r.onDestroy && (n.destroyHooks ??= []).push(i, r.onDestroy))
		: (r = n.data[i])
	let o = r.factory || (r.factory = Kn(r.type, !0)),
		s,
		a = Ne(M)
	try {
		let c = _a(!1),
			u = o()
		return _a(c), iN(n, z(), i, u), u
	} finally {
		Ne(a)
	}
}
function pN(e, t) {
	if (t)
		for (let n = t.length - 1; n >= 0; n--) {
			let r = t[n]
			if (e === r.name) return r
		}
}
function I_(e, t, n) {
	let r = e + te,
		i = z(),
		o = ay(i, r)
	return gN(i, r) ? hN(i, jT(), t, o.transform, n, o) : o.transform(n)
}
function gN(e, t) {
	return e[S].data[t].pure
}
function w_(e, t) {
	return uc(e, t)
}
var Yt = class {
		full
		major
		minor
		patch
		constructor(t) {
			this.full = t
			let n = t.split('.')
			;(this.major = n[0]),
				(this.minor = n[1]),
				(this.patch = n.slice(2).join('.'))
		}
	},
	D_ = new Yt('19.2.2'),
	Pd = class {
		ngModuleFactory
		componentFactories
		constructor(t, n) {
			;(this.ngModuleFactory = t), (this.componentFactories = n)
		}
	},
	wc = (() => {
		class e {
			compileModuleSync(n) {
				return new Md(n)
			}
			compileModuleAsync(n) {
				return Promise.resolve(this.compileModuleSync(n))
			}
			compileModuleAndAllComponentsSync(n) {
				let r = this.compileModuleSync(n),
					i = Gv(n),
					o = yE(i.declarations).reduce((s, a) => {
						let c = yn(a)
						return c && s.push(new qr(c)), s
					}, [])
				return new Pd(r, o)
			}
			compileModuleAndAllComponentsAsync(n) {
				return Promise.resolve(this.compileModuleAndAllComponentsSync(n))
			}
			clearCache() {}
			clearCacheFor(n) {}
			getModuleId(n) {}
			static ɵfac = function (r) {
				return new (r || e)()
			}
			static ɵprov = _({ token: e, factory: e.ɵfac, providedIn: 'root' })
		}
		return e
	})()
var mN = (() => {
		class e {
			zone = g(j)
			changeDetectionScheduler = g(er)
			applicationRef = g(ve)
			_onMicrotaskEmptySubscription
			initialize() {
				this._onMicrotaskEmptySubscription ||
					(this._onMicrotaskEmptySubscription =
						this.zone.onMicrotaskEmpty.subscribe({
							next: () => {
								this.changeDetectionScheduler.runningTick ||
									this.zone.run(() => {
										this.applicationRef.tick()
									})
							},
						}))
			}
			ngOnDestroy() {
				this._onMicrotaskEmptySubscription?.unsubscribe()
			}
			static ɵfac = function (r) {
				return new (r || e)()
			}
			static ɵprov = _({ token: e, factory: e.ɵfac, providedIn: 'root' })
		}
		return e
	})(),
	vN = new E('', { factory: () => !1 })
function b_({
	ngZoneFactory: e,
	ignoreChangesOutsideZone: t,
	scheduleInRootZone: n,
}) {
	return (
		(e ??= () => new j(L(y({}, T_()), { scheduleInRootZone: n }))),
		[
			{ provide: j, useFactory: e },
			{
				provide: vn,
				multi: !0,
				useFactory: () => {
					let r = g(mN, { optional: !0 })
					return () => r.initialize()
				},
			},
			{
				provide: vn,
				multi: !0,
				useFactory: () => {
					let r = g(yN)
					return () => {
						r.initialize()
					}
				},
			},
			t === !0 ? { provide: Vy, useValue: !0 } : [],
			{ provide: jy, useValue: n ?? Ly },
		]
	)
}
function C_(e) {
	let t = e?.ignoreChangesOutsideZone,
		n = e?.scheduleInRootZone,
		r = b_({
			ngZoneFactory: () => {
				let i = T_(e)
				return (
					(i.scheduleInRootZone = n),
					i.shouldCoalesceEventChangeDetection && wn('NgZone_CoalesceEvent'),
					new j(i)
				)
			},
			ignoreChangesOutsideZone: t,
			scheduleInRootZone: n,
		})
	return qe([{ provide: vN, useValue: !0 }, { provide: Ka, useValue: !1 }, r])
}
function T_(e) {
	return {
		enableLongStackTrace: !1,
		shouldCoalesceEventChangeDetection: e?.eventCoalescing ?? !1,
		shouldCoalesceRunChangeDetection: e?.runCoalescing ?? !1,
	}
}
var yN = (() => {
	class e {
		subscription = new X()
		initialized = !1
		zone = g(j)
		pendingTasks = g(Ke)
		initialize() {
			if (this.initialized) return
			this.initialized = !0
			let n = null
			!this.zone.isStable &&
				!this.zone.hasPendingMacrotasks &&
				!this.zone.hasPendingMicrotasks &&
				(n = this.pendingTasks.add()),
				this.zone.runOutsideAngular(() => {
					this.subscription.add(
						this.zone.onStable.subscribe(() => {
							j.assertNotInAngularZone(),
								queueMicrotask(() => {
									n !== null &&
										!this.zone.hasPendingMacrotasks &&
										!this.zone.hasPendingMicrotasks &&
										(this.pendingTasks.remove(n), (n = null))
								})
						})
					)
				}),
				this.subscription.add(
					this.zone.onUnstable.subscribe(() => {
						j.assertInAngularZone(), (n ??= this.pendingTasks.add())
					})
				)
		}
		ngOnDestroy() {
			this.subscription.unsubscribe()
		}
		static ɵfac = function (r) {
			return new (r || e)()
		}
		static ɵprov = _({ token: e, factory: e.ɵfac, providedIn: 'root' })
	}
	return e
})()
var EN = (() => {
	class e {
		appRef = g(ve)
		taskService = g(Ke)
		ngZone = g(j)
		zonelessEnabled = g(Ka)
		tracing = g(ci, { optional: !0 })
		disableScheduling = g(Vy, { optional: !0 }) ?? !1
		zoneIsDefined = typeof Zone < 'u' && !!Zone.root.run
		schedulerTickApplyArgs = [{ data: { __scheduler_tick__: !0 } }]
		subscriptions = new X()
		angularZoneId = this.zoneIsDefined ? this.ngZone._inner?.get(Da) : null
		scheduleInRootZone =
			!this.zonelessEnabled &&
			this.zoneIsDefined &&
			(g(jy, { optional: !0 }) ?? !1)
		cancelScheduledCallback = null
		useMicrotaskScheduler = !1
		runningTick = !1
		pendingRenderTaskId = null
		constructor() {
			this.subscriptions.add(
				this.appRef.afterTick.subscribe(() => {
					this.runningTick || this.cleanup()
				})
			),
				this.subscriptions.add(
					this.ngZone.onUnstable.subscribe(() => {
						this.runningTick || this.cleanup()
					})
				),
				(this.disableScheduling ||=
					!this.zonelessEnabled &&
					(this.ngZone instanceof cd || !this.zoneIsDefined))
		}
		notify(n) {
			if (!this.zonelessEnabled && n === 5) return
			let r = !1
			switch (n) {
				case 0: {
					this.appRef.dirtyFlags |= 2
					break
				}
				case 3:
				case 2:
				case 4:
				case 5:
				case 1: {
					this.appRef.dirtyFlags |= 4
					break
				}
				case 6: {
					;(this.appRef.dirtyFlags |= 2), (r = !0)
					break
				}
				case 12: {
					;(this.appRef.dirtyFlags |= 16), (r = !0)
					break
				}
				case 13: {
					;(this.appRef.dirtyFlags |= 2), (r = !0)
					break
				}
				case 11: {
					r = !0
					break
				}
				case 9:
				case 8:
				case 7:
				case 10:
				default:
					this.appRef.dirtyFlags |= 8
			}
			if (
				((this.appRef.tracingSnapshot =
					this.tracing?.snapshot(this.appRef.tracingSnapshot) ?? null),
				!this.shouldScheduleTick(r))
			)
				return
			let i = this.useMicrotaskScheduler ? qm : Uy
			;(this.pendingRenderTaskId = this.taskService.add()),
				this.scheduleInRootZone
					? (this.cancelScheduledCallback = Zone.root.run(() =>
							i(() => this.tick())
					  ))
					: (this.cancelScheduledCallback = this.ngZone.runOutsideAngular(() =>
							i(() => this.tick())
					  ))
		}
		shouldScheduleTick(n) {
			return !(
				(this.disableScheduling && !n) ||
				this.appRef.destroyed ||
				this.pendingRenderTaskId !== null ||
				this.runningTick ||
				this.appRef._runningTick ||
				(!this.zonelessEnabled &&
					this.zoneIsDefined &&
					Zone.current.get(Da + this.angularZoneId))
			)
		}
		tick() {
			if (this.runningTick || this.appRef.destroyed) return
			if (this.appRef.dirtyFlags === 0) {
				this.cleanup()
				return
			}
			!this.zonelessEnabled &&
				this.appRef.dirtyFlags & 7 &&
				(this.appRef.dirtyFlags |= 1)
			let n = this.taskService.add()
			try {
				this.ngZone.run(
					() => {
						;(this.runningTick = !0), this.appRef._tick()
					},
					void 0,
					this.schedulerTickApplyArgs
				)
			} catch (r) {
				throw (this.taskService.remove(n), r)
			} finally {
				this.cleanup()
			}
			;(this.useMicrotaskScheduler = !0),
				qm(() => {
					;(this.useMicrotaskScheduler = !1), this.taskService.remove(n)
				})
		}
		ngOnDestroy() {
			this.subscriptions.unsubscribe(), this.cleanup()
		}
		cleanup() {
			if (
				((this.runningTick = !1),
				this.cancelScheduledCallback?.(),
				(this.cancelScheduledCallback = null),
				this.pendingRenderTaskId !== null)
			) {
				let n = this.pendingRenderTaskId
				;(this.pendingRenderTaskId = null), this.taskService.remove(n)
			}
		}
		static ɵfac = function (r) {
			return new (r || e)()
		}
		static ɵprov = _({ token: e, factory: e.ɵfac, providedIn: 'root' })
	}
	return e
})()
function _N() {
	return (typeof $localize < 'u' && $localize.locale) || xa
}
var $f = new E('', {
	providedIn: 'root',
	factory: () => g($f, F.Optional | F.SkipSelf) || _N(),
})
var Fd = new E(''),
	IN = new E('')
function qi(e) {
	return !e.moduleRef
}
function wN(e) {
	let t = qi(e) ? e.r3Injector : e.moduleRef.injector,
		n = t.get(j)
	return n.run(() => {
		qi(e)
			? e.r3Injector.resolveInjectorInitializers()
			: e.moduleRef.resolveInjectorInitializers()
		let r = t.get(qt, null),
			i
		if (
			(n.runOutsideAngular(() => {
				i = n.onError.subscribe({
					next: (o) => {
						r.handleError(o)
					},
				})
			}),
			qi(e))
		) {
			let o = () => t.destroy(),
				s = e.platformInjector.get(Fd)
			s.add(o),
				t.onDestroy(() => {
					i.unsubscribe(), s.delete(o)
				})
		} else {
			let o = () => e.moduleRef.destroy(),
				s = e.platformInjector.get(Fd)
			s.add(o),
				e.moduleRef.onDestroy(() => {
					aa(e.allPlatformModules, e.moduleRef), i.unsubscribe(), s.delete(o)
				})
		}
		return bN(r, n, () => {
			let o = t.get(d_)
			return (
				o.runInitializers(),
				o.donePromise.then(() => {
					let s = t.get($f, xa)
					if ((nN(s || xa), !t.get(IN, !0)))
						return qi(e)
							? t.get(ve)
							: (e.allPlatformModules.push(e.moduleRef), e.moduleRef)
					if (qi(e)) {
						let c = t.get(ve)
						return e.rootComponent !== void 0 && c.bootstrap(e.rootComponent), c
					} else return DN(e.moduleRef, e.allPlatformModules), e.moduleRef
				})
			)
		})
	})
}
function DN(e, t) {
	let n = e.injector.get(ve)
	if (e._bootstrapComponents.length > 0)
		e._bootstrapComponents.forEach((r) => n.bootstrap(r))
	else if (e.instance.ngDoBootstrap) e.instance.ngDoBootstrap(n)
	else throw new w(-403, !1)
	t.push(e)
}
function bN(e, t, n) {
	try {
		let r = n()
		return Cn(r)
			? r.catch((i) => {
					throw (t.runOutsideAngular(() => e.handleError(i)), i)
			  })
			: r
	} catch (r) {
		throw (t.runOutsideAngular(() => e.handleError(r)), r)
	}
}
var ca = null
function CN(e = [], t) {
	return ae.create({
		name: t,
		providers: [
			{ provide: Ua, useValue: 'platform' },
			{ provide: Fd, useValue: new Set([() => (ca = null)]) },
			...e,
		],
	})
}
function TN(e = []) {
	if (ca) return ca
	let t = CN(e)
	return (ca = t), ER(), SN(t), t
}
function SN(e) {
	let t = e.get(af, null)
	he(e, () => {
		t?.forEach((n) => n())
	})
}
function Hf() {
	return !1
}
var St = (() => {
	class e {
		static __NG_ELEMENT_ID__ = AN
	}
	return e
})()
function AN(e) {
	return MN(be(), z(), (e & 16) === 16)
}
function MN(e, t, n) {
	if (ir(e) && !n) {
		let r = Dt(e.index, t)
		return new to(r, r)
	} else if (e.type & 175) {
		let r = t[Ge]
		return new to(r, t)
	}
	return null
}
var Ld = class {
		constructor() {}
		supports(t) {
			return c_(t)
		}
		create(t) {
			return new Vd(t)
		}
	},
	RN = (e, t) => t,
	Vd = class {
		length = 0
		collection
		_linkedRecords = null
		_unlinkedRecords = null
		_previousItHead = null
		_itHead = null
		_itTail = null
		_additionsHead = null
		_additionsTail = null
		_movesHead = null
		_movesTail = null
		_removalsHead = null
		_removalsTail = null
		_identityChangesHead = null
		_identityChangesTail = null
		_trackByFn
		constructor(t) {
			this._trackByFn = t || RN
		}
		forEachItem(t) {
			let n
			for (n = this._itHead; n !== null; n = n._next) t(n)
		}
		forEachOperation(t) {
			let n = this._itHead,
				r = this._removalsHead,
				i = 0,
				o = null
			for (; n || r; ) {
				let s = !r || (n && n.currentIndex < bv(r, i, o)) ? n : r,
					a = bv(s, i, o),
					c = s.currentIndex
				if (s === r) i--, (r = r._nextRemoved)
				else if (((n = n._next), s.previousIndex == null)) i++
				else {
					o || (o = [])
					let u = a - i,
						l = c - i
					if (u != l) {
						for (let h = 0; h < u; h++) {
							let f = h < o.length ? o[h] : (o[h] = 0),
								m = f + h
							l <= m && m < u && (o[h] = f + 1)
						}
						let d = s.previousIndex
						o[d] = l - u
					}
				}
				a !== c && t(s, a, c)
			}
		}
		forEachPreviousItem(t) {
			let n
			for (n = this._previousItHead; n !== null; n = n._nextPrevious) t(n)
		}
		forEachAddedItem(t) {
			let n
			for (n = this._additionsHead; n !== null; n = n._nextAdded) t(n)
		}
		forEachMovedItem(t) {
			let n
			for (n = this._movesHead; n !== null; n = n._nextMoved) t(n)
		}
		forEachRemovedItem(t) {
			let n
			for (n = this._removalsHead; n !== null; n = n._nextRemoved) t(n)
		}
		forEachIdentityChange(t) {
			let n
			for (n = this._identityChangesHead; n !== null; n = n._nextIdentityChange)
				t(n)
		}
		diff(t) {
			if ((t == null && (t = []), !c_(t))) throw new w(900, !1)
			return this.check(t) ? this : null
		}
		onDestroy() {}
		check(t) {
			this._reset()
			let n = this._itHead,
				r = !1,
				i,
				o,
				s
			if (Array.isArray(t)) {
				this.length = t.length
				for (let a = 0; a < this.length; a++)
					(o = t[a]),
						(s = this._trackByFn(a, o)),
						n === null || !Object.is(n.trackById, s)
							? ((n = this._mismatch(n, o, s, a)), (r = !0))
							: (r && (n = this._verifyReinsertion(n, o, s, a)),
							  Object.is(n.item, o) || this._addIdentityChange(n, o)),
						(n = n._next)
			} else
				(i = 0),
					iR(t, (a) => {
						;(s = this._trackByFn(i, a)),
							n === null || !Object.is(n.trackById, s)
								? ((n = this._mismatch(n, a, s, i)), (r = !0))
								: (r && (n = this._verifyReinsertion(n, a, s, i)),
								  Object.is(n.item, a) || this._addIdentityChange(n, a)),
							(n = n._next),
							i++
					}),
					(this.length = i)
			return this._truncate(n), (this.collection = t), this.isDirty
		}
		get isDirty() {
			return (
				this._additionsHead !== null ||
				this._movesHead !== null ||
				this._removalsHead !== null ||
				this._identityChangesHead !== null
			)
		}
		_reset() {
			if (this.isDirty) {
				let t
				for (t = this._previousItHead = this._itHead; t !== null; t = t._next)
					t._nextPrevious = t._next
				for (t = this._additionsHead; t !== null; t = t._nextAdded)
					t.previousIndex = t.currentIndex
				for (
					this._additionsHead = this._additionsTail = null, t = this._movesHead;
					t !== null;
					t = t._nextMoved
				)
					t.previousIndex = t.currentIndex
				;(this._movesHead = this._movesTail = null),
					(this._removalsHead = this._removalsTail = null),
					(this._identityChangesHead = this._identityChangesTail = null)
			}
		}
		_mismatch(t, n, r, i) {
			let o
			return (
				t === null ? (o = this._itTail) : ((o = t._prev), this._remove(t)),
				(t =
					this._unlinkedRecords === null
						? null
						: this._unlinkedRecords.get(r, null)),
				t !== null
					? (Object.is(t.item, n) || this._addIdentityChange(t, n),
					  this._reinsertAfter(t, o, i))
					: ((t =
							this._linkedRecords === null
								? null
								: this._linkedRecords.get(r, i)),
					  t !== null
							? (Object.is(t.item, n) || this._addIdentityChange(t, n),
							  this._moveAfter(t, o, i))
							: (t = this._addAfter(new jd(n, r), o, i))),
				t
			)
		}
		_verifyReinsertion(t, n, r, i) {
			let o =
				this._unlinkedRecords === null
					? null
					: this._unlinkedRecords.get(r, null)
			return (
				o !== null
					? (t = this._reinsertAfter(o, t._prev, i))
					: t.currentIndex != i &&
					  ((t.currentIndex = i), this._addToMoves(t, i)),
				t
			)
		}
		_truncate(t) {
			for (; t !== null; ) {
				let n = t._next
				this._addToRemovals(this._unlink(t)), (t = n)
			}
			this._unlinkedRecords !== null && this._unlinkedRecords.clear(),
				this._additionsTail !== null && (this._additionsTail._nextAdded = null),
				this._movesTail !== null && (this._movesTail._nextMoved = null),
				this._itTail !== null && (this._itTail._next = null),
				this._removalsTail !== null && (this._removalsTail._nextRemoved = null),
				this._identityChangesTail !== null &&
					(this._identityChangesTail._nextIdentityChange = null)
		}
		_reinsertAfter(t, n, r) {
			this._unlinkedRecords !== null && this._unlinkedRecords.remove(t)
			let i = t._prevRemoved,
				o = t._nextRemoved
			return (
				i === null ? (this._removalsHead = o) : (i._nextRemoved = o),
				o === null ? (this._removalsTail = i) : (o._prevRemoved = i),
				this._insertAfter(t, n, r),
				this._addToMoves(t, r),
				t
			)
		}
		_moveAfter(t, n, r) {
			return (
				this._unlink(t), this._insertAfter(t, n, r), this._addToMoves(t, r), t
			)
		}
		_addAfter(t, n, r) {
			return (
				this._insertAfter(t, n, r),
				this._additionsTail === null
					? (this._additionsTail = this._additionsHead = t)
					: (this._additionsTail = this._additionsTail._nextAdded = t),
				t
			)
		}
		_insertAfter(t, n, r) {
			let i = n === null ? this._itHead : n._next
			return (
				(t._next = i),
				(t._prev = n),
				i === null ? (this._itTail = t) : (i._prev = t),
				n === null ? (this._itHead = t) : (n._next = t),
				this._linkedRecords === null && (this._linkedRecords = new Pa()),
				this._linkedRecords.put(t),
				(t.currentIndex = r),
				t
			)
		}
		_remove(t) {
			return this._addToRemovals(this._unlink(t))
		}
		_unlink(t) {
			this._linkedRecords !== null && this._linkedRecords.remove(t)
			let n = t._prev,
				r = t._next
			return (
				n === null ? (this._itHead = r) : (n._next = r),
				r === null ? (this._itTail = n) : (r._prev = n),
				t
			)
		}
		_addToMoves(t, n) {
			return (
				t.previousIndex === n ||
					(this._movesTail === null
						? (this._movesTail = this._movesHead = t)
						: (this._movesTail = this._movesTail._nextMoved = t)),
				t
			)
		}
		_addToRemovals(t) {
			return (
				this._unlinkedRecords === null && (this._unlinkedRecords = new Pa()),
				this._unlinkedRecords.put(t),
				(t.currentIndex = null),
				(t._nextRemoved = null),
				this._removalsTail === null
					? ((this._removalsTail = this._removalsHead = t),
					  (t._prevRemoved = null))
					: ((t._prevRemoved = this._removalsTail),
					  (this._removalsTail = this._removalsTail._nextRemoved = t)),
				t
			)
		}
		_addIdentityChange(t, n) {
			return (
				(t.item = n),
				this._identityChangesTail === null
					? (this._identityChangesTail = this._identityChangesHead = t)
					: (this._identityChangesTail =
							this._identityChangesTail._nextIdentityChange =
								t),
				t
			)
		}
	},
	jd = class {
		item
		trackById
		currentIndex = null
		previousIndex = null
		_nextPrevious = null
		_prev = null
		_next = null
		_prevDup = null
		_nextDup = null
		_prevRemoved = null
		_nextRemoved = null
		_nextAdded = null
		_nextMoved = null
		_nextIdentityChange = null
		constructor(t, n) {
			;(this.item = t), (this.trackById = n)
		}
	},
	Ud = class {
		_head = null
		_tail = null
		add(t) {
			this._head === null
				? ((this._head = this._tail = t),
				  (t._nextDup = null),
				  (t._prevDup = null))
				: ((this._tail._nextDup = t),
				  (t._prevDup = this._tail),
				  (t._nextDup = null),
				  (this._tail = t))
		}
		get(t, n) {
			let r
			for (r = this._head; r !== null; r = r._nextDup)
				if ((n === null || n <= r.currentIndex) && Object.is(r.trackById, t))
					return r
			return null
		}
		remove(t) {
			let n = t._prevDup,
				r = t._nextDup
			return (
				n === null ? (this._head = r) : (n._nextDup = r),
				r === null ? (this._tail = n) : (r._prevDup = n),
				this._head === null
			)
		}
	},
	Pa = class {
		map = new Map()
		put(t) {
			let n = t.trackById,
				r = this.map.get(n)
			r || ((r = new Ud()), this.map.set(n, r)), r.add(t)
		}
		get(t, n) {
			let r = t,
				i = this.map.get(r)
			return i ? i.get(t, n) : null
		}
		remove(t) {
			let n = t.trackById
			return this.map.get(n).remove(t) && this.map.delete(n), t
		}
		get isEmpty() {
			return this.map.size === 0
		}
		clear() {
			this.map.clear()
		}
	}
function bv(e, t, n) {
	let r = e.previousIndex
	if (r === null) return r
	let i = 0
	return n && r < n.length && (i = n[r]), r + t + i
}
function Cv() {
	return new zf([new Ld()])
}
var zf = (() => {
	class e {
		factories
		static ɵprov = _({ token: e, providedIn: 'root', factory: Cv })
		constructor(n) {
			this.factories = n
		}
		static create(n, r) {
			if (r != null) {
				let i = r.factories.slice()
				n = n.concat(i)
			}
			return new e(n)
		}
		static extend(n) {
			return {
				provide: e,
				useFactory: (r) => e.create(n, r || Cv()),
				deps: [[e, new sT(), new Zt()]],
			}
		}
		find(n) {
			let r = this.factories.find((i) => i.supports(n))
			if (r != null) return r
			throw new w(901, !1)
		}
	}
	return e
})()
var S_ = (() => {
	class e {
		constructor(n) {}
		static ɵfac = function (r) {
			return new (r || e)(I(ve))
		}
		static ɵmod = ct({ type: e })
		static ɵinj = ot({})
	}
	return e
})()
function A_(e) {
	G(8)
	try {
		let { rootComponent: t, appProviders: n, platformProviders: r } = e,
			i = TN(r),
			o = [b_({}), { provide: er, useExisting: EN }, ...(n || [])],
			s = new Oa({
				providers: o,
				parent: i,
				debugName: '',
				runEnvironmentInitializers: !1,
			})
		return wN({ r3Injector: s.injector, platformInjector: i, rootComponent: t })
	} catch (t) {
		return Promise.reject(t)
	} finally {
		G(9)
	}
}
var ta = new WeakSet(),
	Tv = '',
	ua = []
function Sv(e) {
	return e.get(iE, HS)
}
function M_() {
	let e = [
		{
			provide: iE,
			useFactory: () => {
				let t = !0
				{
					let n = g(tr)
					t = !!window._ejsas?.[n]
				}
				return t && wn('NgEventReplay'), t
			},
		},
	]
	return (
		e.push(
			{
				provide: vn,
				useValue: () => {
					let t = g(ve),
						{ injector: n } = t
					if (!ta.has(t)) {
						let r = g(Jm)
						Sv(n) &&
							_v((i, o, s) => {
								i.nodeType === Node.ELEMENT_NODE && (a0(i, o, s), c0(i, r))
							})
					}
				},
				multi: !0,
			},
			{
				provide: Tn,
				useFactory: () => {
					let t = g(tr),
						n = g(ve),
						{ injector: r } = n
					return () => {
						!Sv(r) ||
							ta.has(n) ||
							(ta.add(n),
							n.onDestroy(() => {
								ta.delete(n), Ml(t), _v(() => {})
							}),
							n.whenStable().then(() => {
								if (n.destroyed) return
								let i = r.get(l0)
								NN(i, r)
								let o = r.get(Jm)
								o.get(Tv)?.forEach(u0), o.delete(Tv)
								let s = i.instance
								_0(r) ? n.onDestroy(() => s.cleanUp()) : s.cleanUp()
							}))
					}
				},
				multi: !0,
			}
		),
		e
	)
}
var NN = (e, t) => {
	let n = t.get(tr),
		r = window._ejsas[n],
		i = (e.instance = new Rm(new Ys(r.c)))
	for (let a of r.et) i.addEvent(a)
	for (let a of r.etc) i.addEvent(a)
	let o = Nm(n)
	i.replayEarlyEventInfos(o), Ml(n)
	let s = new Zs((a) => {
		ON(t, a, a.currentTarget)
	})
	Mm(i, s)
}
function ON(e, t, n) {
	let r = (n && n.getAttribute(ec)) ?? ''
	;/d\d+/.test(r) ? kN(r, e, t, n) : t.eventPhase === Al.REPLAY && uE(t, n)
}
function kN(e, t, n, r) {
	ua.push({ event: n, currentTarget: r }), TR(t, e, xN)
}
function xN(e) {
	let t = [...ua],
		n = new Set(e)
	ua = []
	for (let { event: r, currentTarget: i } of t) {
		let o = i.getAttribute(ec)
		n.has(o) ? uE(r, i) : ua.push({ event: r, currentTarget: i })
	}
}
var Av = !1
function PN() {
	Av || ((Av = !0), m0(), QR(), sN(), eN(), lR(), PM(), cM(), tA())
}
function FN(e) {
	return e.whenStable()
}
function R_() {
	let e = [
		{
			provide: Js,
			useFactory: () => {
				let t = !0
				return (
					(t = !!g(ai, { optional: !0 })?.get(lE, null)),
					t && wn('NgHydration'),
					t
				)
			},
		},
		{
			provide: vn,
			useValue: () => {
				tM(!1), g(Js) && (LN(), PN())
			},
			multi: !0,
		},
	]
	return (
		e.push(
			{ provide: rE, useFactory: () => g(Js) },
			{
				provide: Tn,
				useFactory: () => {
					if (g(Js)) {
						let t = g(ve)
						return () => {
							FN(t).then(() => {
								t.destroyed || qE(t)
							})
						}
					}
					return () => {}
				},
				multi: !0,
			}
		),
		qe(e)
	)
}
function LN() {
	let e = Za(),
		t
	for (let n of e.body.childNodes)
		if (n.nodeType === Node.COMMENT_NODE && n.textContent?.trim() === p0) {
			t = n
			break
		}
	if (!t) throw new w(-507, !1)
}
function An(e) {
	return typeof e == 'boolean' ? e : e != null && e !== 'false'
}
function ut(e) {
	let t = U(null)
	try {
		return e()
	} finally {
		U(t)
	}
}
function fi(e, t) {
	let n = Vg(e)
	return t?.equal && (n[Fe].equal = t.equal), n
}
var Mv = class {
	[Fe]
	constructor(t) {
		this[Fe] = t
	}
	destroy() {
		this[Fe].destroy()
	}
}
function N_(e) {
	let t = yn(e)
	if (!t) return null
	let n = new qr(t)
	return {
		get selector() {
			return n.selector
		},
		get type() {
			return n.componentType
		},
		get inputs() {
			return n.inputs
		},
		get outputs() {
			return n.outputs
		},
		get ngContentSelectors() {
			return n.ngContentSelectors
		},
		get isStandalone() {
			return t.standalone
		},
		get isSignal() {
			return t.signals
		},
	}
}
var L_ = null
function At() {
	return L_
}
function V_(e) {
	L_ ??= e
}
var Dc = class {}
var _e = new E(''),
	Qf = (() => {
		class e {
			historyGo(n) {
				throw new Error('')
			}
			static ɵfac = function (r) {
				return new (r || e)()
			}
			static ɵprov = _({
				token: e,
				factory: () => g(VN),
				providedIn: 'platform',
			})
		}
		return e
	})(),
	j_ = new E(''),
	VN = (() => {
		class e extends Qf {
			_location
			_history
			_doc = g(_e)
			constructor() {
				super(),
					(this._location = window.location),
					(this._history = window.history)
			}
			getBaseHrefFromDOM() {
				return At().getBaseHref(this._doc)
			}
			onPopState(n) {
				let r = At().getGlobalEventTarget(this._doc, 'window')
				return (
					r.addEventListener('popstate', n, !1),
					() => r.removeEventListener('popstate', n)
				)
			}
			onHashChange(n) {
				let r = At().getGlobalEventTarget(this._doc, 'window')
				return (
					r.addEventListener('hashchange', n, !1),
					() => r.removeEventListener('hashchange', n)
				)
			}
			get href() {
				return this._location.href
			}
			get protocol() {
				return this._location.protocol
			}
			get hostname() {
				return this._location.hostname
			}
			get port() {
				return this._location.port
			}
			get pathname() {
				return this._location.pathname
			}
			get search() {
				return this._location.search
			}
			get hash() {
				return this._location.hash
			}
			set pathname(n) {
				this._location.pathname = n
			}
			pushState(n, r, i) {
				this._history.pushState(n, r, i)
			}
			replaceState(n, r, i) {
				this._history.replaceState(n, r, i)
			}
			forward() {
				this._history.forward()
			}
			back() {
				this._history.back()
			}
			historyGo(n = 0) {
				this._history.go(n)
			}
			getState() {
				return this._history.state
			}
			static ɵfac = function (r) {
				return new (r || e)()
			}
			static ɵprov = _({
				token: e,
				factory: () => new e(),
				providedIn: 'platform',
			})
		}
		return e
	})()
function Jf(e, t) {
	return e
		? t
			? e.endsWith('/')
				? t.startsWith('/')
					? e + t.slice(1)
					: e + t
				: t.startsWith('/')
				? e + t
				: `${e}/${t}`
			: e
		: t
}
function O_(e) {
	let t = e.search(/#|\?|$/)
	return e[t - 1] === '/' ? e.slice(0, t - 1) + e.slice(t) : e
}
function Jt(e) {
	return e && e[0] !== '?' ? `?${e}` : e
}
var Xt = (() => {
		class e {
			historyGo(n) {
				throw new Error('')
			}
			static ɵfac = function (r) {
				return new (r || e)()
			}
			static ɵprov = _({ token: e, factory: () => g(Xf), providedIn: 'root' })
		}
		return e
	})(),
	U_ = new E(''),
	Xf = (() => {
		class e extends Xt {
			_platformLocation
			_baseHref
			_removeListenerFns = []
			constructor(n, r) {
				super(),
					(this._platformLocation = n),
					(this._baseHref =
						r ??
						this._platformLocation.getBaseHrefFromDOM() ??
						g(_e).location?.origin ??
						'')
			}
			ngOnDestroy() {
				for (; this._removeListenerFns.length; ) this._removeListenerFns.pop()()
			}
			onPopState(n) {
				this._removeListenerFns.push(
					this._platformLocation.onPopState(n),
					this._platformLocation.onHashChange(n)
				)
			}
			getBaseHref() {
				return this._baseHref
			}
			prepareExternalUrl(n) {
				return Jf(this._baseHref, n)
			}
			path(n = !1) {
				let r =
						this._platformLocation.pathname + Jt(this._platformLocation.search),
					i = this._platformLocation.hash
				return i && n ? `${r}${i}` : r
			}
			pushState(n, r, i, o) {
				let s = this.prepareExternalUrl(i + Jt(o))
				this._platformLocation.pushState(n, r, s)
			}
			replaceState(n, r, i, o) {
				let s = this.prepareExternalUrl(i + Jt(o))
				this._platformLocation.replaceState(n, r, s)
			}
			forward() {
				this._platformLocation.forward()
			}
			back() {
				this._platformLocation.back()
			}
			getState() {
				return this._platformLocation.getState()
			}
			historyGo(n = 0) {
				this._platformLocation.historyGo?.(n)
			}
			static ɵfac = function (r) {
				return new (r || e)(I(Qf), I(U_, 8))
			}
			static ɵprov = _({ token: e, factory: e.ɵfac, providedIn: 'root' })
		}
		return e
	})(),
	B_ = (() => {
		class e extends Xt {
			_platformLocation
			_baseHref = ''
			_removeListenerFns = []
			constructor(n, r) {
				super(), (this._platformLocation = n), r != null && (this._baseHref = r)
			}
			ngOnDestroy() {
				for (; this._removeListenerFns.length; ) this._removeListenerFns.pop()()
			}
			onPopState(n) {
				this._removeListenerFns.push(
					this._platformLocation.onPopState(n),
					this._platformLocation.onHashChange(n)
				)
			}
			getBaseHref() {
				return this._baseHref
			}
			path(n = !1) {
				let r = this._platformLocation.hash ?? '#'
				return r.length > 0 ? r.substring(1) : r
			}
			prepareExternalUrl(n) {
				let r = Jf(this._baseHref, n)
				return r.length > 0 ? '#' + r : r
			}
			pushState(n, r, i, o) {
				let s =
					this.prepareExternalUrl(i + Jt(o)) || this._platformLocation.pathname
				this._platformLocation.pushState(n, r, s)
			}
			replaceState(n, r, i, o) {
				let s =
					this.prepareExternalUrl(i + Jt(o)) || this._platformLocation.pathname
				this._platformLocation.replaceState(n, r, s)
			}
			forward() {
				this._platformLocation.forward()
			}
			back() {
				this._platformLocation.back()
			}
			getState() {
				return this._platformLocation.getState()
			}
			historyGo(n = 0) {
				this._platformLocation.historyGo?.(n)
			}
			static ɵfac = function (r) {
				return new (r || e)(I(Qf), I(U_, 8))
			}
			static ɵprov = _({ token: e, factory: e.ɵfac })
		}
		return e
	})(),
	pi = (() => {
		class e {
			_subject = new ie()
			_basePath
			_locationStrategy
			_urlChangeListeners = []
			_urlChangeSubscription = null
			constructor(n) {
				this._locationStrategy = n
				let r = this._locationStrategy.getBaseHref()
				;(this._basePath = BN(O_(k_(r)))),
					this._locationStrategy.onPopState((i) => {
						this._subject.next({
							url: this.path(!0),
							pop: !0,
							state: i.state,
							type: i.type,
						})
					})
			}
			ngOnDestroy() {
				this._urlChangeSubscription?.unsubscribe(),
					(this._urlChangeListeners = [])
			}
			path(n = !1) {
				return this.normalize(this._locationStrategy.path(n))
			}
			getState() {
				return this._locationStrategy.getState()
			}
			isCurrentPathEqualTo(n, r = '') {
				return this.path() == this.normalize(n + Jt(r))
			}
			normalize(n) {
				return e.stripTrailingSlash(UN(this._basePath, k_(n)))
			}
			prepareExternalUrl(n) {
				return (
					n && n[0] !== '/' && (n = '/' + n),
					this._locationStrategy.prepareExternalUrl(n)
				)
			}
			go(n, r = '', i = null) {
				this._locationStrategy.pushState(i, '', n, r),
					this._notifyUrlChangeListeners(this.prepareExternalUrl(n + Jt(r)), i)
			}
			replaceState(n, r = '', i = null) {
				this._locationStrategy.replaceState(i, '', n, r),
					this._notifyUrlChangeListeners(this.prepareExternalUrl(n + Jt(r)), i)
			}
			forward() {
				this._locationStrategy.forward()
			}
			back() {
				this._locationStrategy.back()
			}
			historyGo(n = 0) {
				this._locationStrategy.historyGo?.(n)
			}
			onUrlChange(n) {
				return (
					this._urlChangeListeners.push(n),
					(this._urlChangeSubscription ??= this.subscribe((r) => {
						this._notifyUrlChangeListeners(r.url, r.state)
					})),
					() => {
						let r = this._urlChangeListeners.indexOf(n)
						this._urlChangeListeners.splice(r, 1),
							this._urlChangeListeners.length === 0 &&
								(this._urlChangeSubscription?.unsubscribe(),
								(this._urlChangeSubscription = null))
					}
				)
			}
			_notifyUrlChangeListeners(n = '', r) {
				this._urlChangeListeners.forEach((i) => i(n, r))
			}
			subscribe(n, r, i) {
				return this._subject.subscribe({
					next: n,
					error: r ?? void 0,
					complete: i ?? void 0,
				})
			}
			static normalizeQueryParams = Jt
			static joinWithSlash = Jf
			static stripTrailingSlash = O_
			static ɵfac = function (r) {
				return new (r || e)(I(Xt))
			}
			static ɵprov = _({ token: e, factory: () => jN(), providedIn: 'root' })
		}
		return e
	})()
function jN() {
	return new pi(I(Xt))
}
function UN(e, t) {
	if (!e || !t.startsWith(e)) return t
	let n = t.substring(e.length)
	return n === '' || ['/', ';', '?', '#'].includes(n[0]) ? n : t
}
function k_(e) {
	return e.replace(/\/index.html$/, '')
}
function BN(e) {
	if (new RegExp('^(https?:)?//').test(e)) {
		let [, n] = e.split(/\/\/[^\/]+/)
		return n
	}
	return e
}
function bc(e, t) {
	t = encodeURIComponent(t)
	for (let n of e.split(';')) {
		let r = n.indexOf('='),
			[i, o] = r == -1 ? [n, ''] : [n.slice(0, r), n.slice(r + 1)]
		if (i.trim() === t) return decodeURIComponent(o)
	}
	return null
}
var Wf = /\s+/,
	x_ = [],
	$_ = (() => {
		class e {
			_ngEl
			_renderer
			initialClasses = x_
			rawClass
			stateMap = new Map()
			constructor(n, r) {
				;(this._ngEl = n), (this._renderer = r)
			}
			set klass(n) {
				this.initialClasses = n != null ? n.trim().split(Wf) : x_
			}
			set ngClass(n) {
				this.rawClass = typeof n == 'string' ? n.trim().split(Wf) : n
			}
			ngDoCheck() {
				for (let r of this.initialClasses) this._updateState(r, !0)
				let n = this.rawClass
				if (Array.isArray(n) || n instanceof Set)
					for (let r of n) this._updateState(r, !0)
				else if (n != null)
					for (let r of Object.keys(n)) this._updateState(r, !!n[r])
				this._applyStateDiff()
			}
			_updateState(n, r) {
				let i = this.stateMap.get(n)
				i !== void 0
					? (i.enabled !== r && ((i.changed = !0), (i.enabled = r)),
					  (i.touched = !0))
					: this.stateMap.set(n, { enabled: r, changed: !0, touched: !0 })
			}
			_applyStateDiff() {
				for (let n of this.stateMap) {
					let r = n[0],
						i = n[1]
					i.changed
						? (this._toggleClass(r, i.enabled), (i.changed = !1))
						: i.touched ||
						  (i.enabled && this._toggleClass(r, !1), this.stateMap.delete(r)),
						(i.touched = !1)
				}
			}
			_toggleClass(n, r) {
				;(n = n.trim()),
					n.length > 0 &&
						n.split(Wf).forEach((i) => {
							r
								? this._renderer.addClass(this._ngEl.nativeElement, i)
								: this._renderer.removeClass(this._ngEl.nativeElement, i)
						})
			}
			static ɵfac = function (r) {
				return new (r || e)(M(Ye), M(Dn))
			}
			static ɵdir = Ce({
				type: e,
				selectors: [['', 'ngClass', '']],
				inputs: { klass: [0, 'class', 'klass'], ngClass: 'ngClass' },
			})
		}
		return e
	})()
var Gf = class {
		$implicit
		ngForOf
		index
		count
		constructor(t, n, r, i) {
			;(this.$implicit = t),
				(this.ngForOf = n),
				(this.index = r),
				(this.count = i)
		}
		get first() {
			return this.index === 0
		}
		get last() {
			return this.index === this.count - 1
		}
		get even() {
			return this.index % 2 === 0
		}
		get odd() {
			return !this.even
		}
	},
	H_ = (() => {
		class e {
			_viewContainer
			_template
			_differs
			set ngForOf(n) {
				;(this._ngForOf = n), (this._ngForOfDirty = !0)
			}
			set ngForTrackBy(n) {
				this._trackByFn = n
			}
			get ngForTrackBy() {
				return this._trackByFn
			}
			_ngForOf = null
			_ngForOfDirty = !0
			_differ = null
			_trackByFn
			constructor(n, r, i) {
				;(this._viewContainer = n), (this._template = r), (this._differs = i)
			}
			set ngForTemplate(n) {
				n && (this._template = n)
			}
			ngDoCheck() {
				if (this._ngForOfDirty) {
					this._ngForOfDirty = !1
					let n = this._ngForOf
					!this._differ &&
						n &&
						(this._differ = this._differs.find(n).create(this.ngForTrackBy))
				}
				if (this._differ) {
					let n = this._differ.diff(this._ngForOf)
					n && this._applyChanges(n)
				}
			}
			_applyChanges(n) {
				let r = this._viewContainer
				n.forEachOperation((i, o, s) => {
					if (i.previousIndex == null)
						r.createEmbeddedView(
							this._template,
							new Gf(i.item, this._ngForOf, -1, -1),
							s === null ? void 0 : s
						)
					else if (s == null) r.remove(o === null ? void 0 : o)
					else if (o !== null) {
						let a = r.get(o)
						r.move(a, s), P_(a, i)
					}
				})
				for (let i = 0, o = r.length; i < o; i++) {
					let a = r.get(i).context
					;(a.index = i), (a.count = o), (a.ngForOf = this._ngForOf)
				}
				n.forEachIdentityChange((i) => {
					let o = r.get(i.currentIndex)
					P_(o, i)
				})
			}
			static ngTemplateContextGuard(n, r) {
				return !0
			}
			static ɵfac = function (r) {
				return new (r || e)(M(bn), M(nr), M(zf))
			}
			static ɵdir = Ce({
				type: e,
				selectors: [['', 'ngFor', '', 'ngForOf', '']],
				inputs: {
					ngForOf: 'ngForOf',
					ngForTrackBy: 'ngForTrackBy',
					ngForTemplate: 'ngForTemplate',
				},
			})
		}
		return e
	})()
function P_(e, t) {
	e.context.$implicit = t.item
}
var gi = (() => {
		class e {
			_viewContainer
			_context = new qf()
			_thenTemplateRef = null
			_elseTemplateRef = null
			_thenViewRef = null
			_elseViewRef = null
			constructor(n, r) {
				;(this._viewContainer = n), (this._thenTemplateRef = r)
			}
			set ngIf(n) {
				;(this._context.$implicit = this._context.ngIf = n), this._updateView()
			}
			set ngIfThen(n) {
				F_(n, !1),
					(this._thenTemplateRef = n),
					(this._thenViewRef = null),
					this._updateView()
			}
			set ngIfElse(n) {
				F_(n, !1),
					(this._elseTemplateRef = n),
					(this._elseViewRef = null),
					this._updateView()
			}
			_updateView() {
				this._context.$implicit
					? this._thenViewRef ||
					  (this._viewContainer.clear(),
					  (this._elseViewRef = null),
					  this._thenTemplateRef &&
							(this._thenViewRef = this._viewContainer.createEmbeddedView(
								this._thenTemplateRef,
								this._context
							)))
					: this._elseViewRef ||
					  (this._viewContainer.clear(),
					  (this._thenViewRef = null),
					  this._elseTemplateRef &&
							(this._elseViewRef = this._viewContainer.createEmbeddedView(
								this._elseTemplateRef,
								this._context
							)))
			}
			static ngIfUseIfTypeGuard
			static ngTemplateGuard_ngIf
			static ngTemplateContextGuard(n, r) {
				return !0
			}
			static ɵfac = function (r) {
				return new (r || e)(M(bn), M(nr))
			}
			static ɵdir = Ce({
				type: e,
				selectors: [['', 'ngIf', '']],
				inputs: { ngIf: 'ngIf', ngIfThen: 'ngIfThen', ngIfElse: 'ngIfElse' },
			})
		}
		return e
	})(),
	qf = class {
		$implicit = null
		ngIf = null
	}
function F_(e, t) {
	if (e && !e.createEmbeddedView) throw new w(2020, !1)
}
function $N(e, t) {
	return new w(2100, !1)
}
var Kf = class {
		createSubscription(t, n) {
			return ut(() =>
				t.subscribe({
					next: n,
					error: (r) => {
						throw r
					},
				})
			)
		}
		dispose(t) {
			ut(() => t.unsubscribe())
		}
	},
	Yf = class {
		createSubscription(t, n) {
			return t.then(n, (r) => {
				throw r
			})
		}
		dispose(t) {}
	},
	HN = new Yf(),
	zN = new Kf(),
	z_ = (() => {
		class e {
			_ref
			_latestValue = null
			markForCheckOnValueUpdate = !0
			_subscription = null
			_obj = null
			_strategy = null
			constructor(n) {
				this._ref = n
			}
			ngOnDestroy() {
				this._subscription && this._dispose(), (this._ref = null)
			}
			transform(n) {
				if (!this._obj) {
					if (n)
						try {
							;(this.markForCheckOnValueUpdate = !1), this._subscribe(n)
						} finally {
							this.markForCheckOnValueUpdate = !0
						}
					return this._latestValue
				}
				return n !== this._obj
					? (this._dispose(), this.transform(n))
					: this._latestValue
			}
			_subscribe(n) {
				;(this._obj = n),
					(this._strategy = this._selectStrategy(n)),
					(this._subscription = this._strategy.createSubscription(n, (r) =>
						this._updateLatestValue(n, r)
					))
			}
			_selectStrategy(n) {
				if (Cn(n)) return HN
				if (Ff(n)) return zN
				throw $N(e, n)
			}
			_dispose() {
				this._strategy.dispose(this._subscription),
					(this._latestValue = null),
					(this._subscription = null),
					(this._obj = null)
			}
			_updateLatestValue(n, r) {
				n === this._obj &&
					((this._latestValue = r),
					this.markForCheckOnValueUpdate && this._ref?.markForCheck())
			}
			static ɵfac = function (r) {
				return new (r || e)(M(St, 16))
			}
			static ɵpipe = o_({ name: 'async', type: e, pure: !1 })
		}
		return e
	})()
var Mt = (() => {
		class e {
			static ɵfac = function (r) {
				return new (r || e)()
			}
			static ɵmod = ct({ type: e })
			static ɵinj = ot({})
		}
		return e
	})(),
	eh = 'browser',
	WN = 'server'
function Mn(e) {
	return e === eh
}
function th(e) {
	return e === WN
}
var W_ = (() => {
		class e {
			static ɵprov = _({
				token: e,
				providedIn: 'root',
				factory: () => new Zf(g(_e), window),
			})
		}
		return e
	})(),
	Zf = class {
		document
		window
		offset = () => [0, 0]
		constructor(t, n) {
			;(this.document = t), (this.window = n)
		}
		setOffset(t) {
			Array.isArray(t) ? (this.offset = () => t) : (this.offset = t)
		}
		getScrollPosition() {
			return [this.window.scrollX, this.window.scrollY]
		}
		scrollToPosition(t) {
			this.window.scrollTo(t[0], t[1])
		}
		scrollToAnchor(t) {
			let n = GN(this.document, t)
			n && (this.scrollToElement(n), n.focus())
		}
		setHistoryScrollRestoration(t) {
			this.window.history.scrollRestoration = t
		}
		scrollToElement(t) {
			let n = t.getBoundingClientRect(),
				r = n.left + this.window.pageXOffset,
				i = n.top + this.window.pageYOffset,
				o = this.offset()
			this.window.scrollTo(r - o[0], i - o[1])
		}
	}
function GN(e, t) {
	let n = e.getElementById(t) || e.getElementsByName(t)[0]
	if (n) return n
	if (
		typeof e.createTreeWalker == 'function' &&
		e.body &&
		typeof e.body.attachShadow == 'function'
	) {
		let r = e.createTreeWalker(e.body, NodeFilter.SHOW_ELEMENT),
			i = r.currentNode
		for (; i; ) {
			let o = i.shadowRoot
			if (o) {
				let s = o.getElementById(t) || o.querySelector(`[name="${t}"]`)
				if (s) return s
			}
			i = r.nextNode()
		}
	}
	return null
}
var hi = class {}
var _o = class {},
	Io = class {},
	Rt = class e {
		headers
		normalizedNames = new Map()
		lazyInit
		lazyUpdate = null
		constructor(t) {
			t
				? typeof t == 'string'
					? (this.lazyInit = () => {
							;(this.headers = new Map()),
								t
									.split(
										`
`
									)
									.forEach((n) => {
										let r = n.indexOf(':')
										if (r > 0) {
											let i = n.slice(0, r),
												o = n.slice(r + 1).trim()
											this.addHeaderEntry(i, o)
										}
									})
					  })
					: typeof Headers < 'u' && t instanceof Headers
					? ((this.headers = new Map()),
					  t.forEach((n, r) => {
							this.addHeaderEntry(r, n)
					  }))
					: (this.lazyInit = () => {
							;(this.headers = new Map()),
								Object.entries(t).forEach(([n, r]) => {
									this.setHeaderEntries(n, r)
								})
					  })
				: (this.headers = new Map())
		}
		has(t) {
			return this.init(), this.headers.has(t.toLowerCase())
		}
		get(t) {
			this.init()
			let n = this.headers.get(t.toLowerCase())
			return n && n.length > 0 ? n[0] : null
		}
		keys() {
			return this.init(), Array.from(this.normalizedNames.values())
		}
		getAll(t) {
			return this.init(), this.headers.get(t.toLowerCase()) || null
		}
		append(t, n) {
			return this.clone({ name: t, value: n, op: 'a' })
		}
		set(t, n) {
			return this.clone({ name: t, value: n, op: 's' })
		}
		delete(t, n) {
			return this.clone({ name: t, value: n, op: 'd' })
		}
		maybeSetNormalizedName(t, n) {
			this.normalizedNames.has(n) || this.normalizedNames.set(n, t)
		}
		init() {
			this.lazyInit &&
				(this.lazyInit instanceof e
					? this.copyFrom(this.lazyInit)
					: this.lazyInit(),
				(this.lazyInit = null),
				this.lazyUpdate &&
					(this.lazyUpdate.forEach((t) => this.applyUpdate(t)),
					(this.lazyUpdate = null)))
		}
		copyFrom(t) {
			t.init(),
				Array.from(t.headers.keys()).forEach((n) => {
					this.headers.set(n, t.headers.get(n)),
						this.normalizedNames.set(n, t.normalizedNames.get(n))
				})
		}
		clone(t) {
			let n = new e()
			return (
				(n.lazyInit =
					this.lazyInit && this.lazyInit instanceof e ? this.lazyInit : this),
				(n.lazyUpdate = (this.lazyUpdate || []).concat([t])),
				n
			)
		}
		applyUpdate(t) {
			let n = t.name.toLowerCase()
			switch (t.op) {
				case 'a':
				case 's':
					let r = t.value
					if ((typeof r == 'string' && (r = [r]), r.length === 0)) return
					this.maybeSetNormalizedName(t.name, n)
					let i = (t.op === 'a' ? this.headers.get(n) : void 0) || []
					i.push(...r), this.headers.set(n, i)
					break
				case 'd':
					let o = t.value
					if (!o) this.headers.delete(n), this.normalizedNames.delete(n)
					else {
						let s = this.headers.get(n)
						if (!s) return
						;(s = s.filter((a) => o.indexOf(a) === -1)),
							s.length === 0
								? (this.headers.delete(n), this.normalizedNames.delete(n))
								: this.headers.set(n, s)
					}
					break
			}
		}
		addHeaderEntry(t, n) {
			let r = t.toLowerCase()
			this.maybeSetNormalizedName(t, r),
				this.headers.has(r)
					? this.headers.get(r).push(n)
					: this.headers.set(r, [n])
		}
		setHeaderEntries(t, n) {
			let r = (Array.isArray(n) ? n : [n]).map((o) => o.toString()),
				i = t.toLowerCase()
			this.headers.set(i, r), this.maybeSetNormalizedName(t, i)
		}
		forEach(t) {
			this.init(),
				Array.from(this.normalizedNames.keys()).forEach((n) =>
					t(this.normalizedNames.get(n), this.headers.get(n))
				)
		}
	}
var ih = class {
	encodeKey(t) {
		return G_(t)
	}
	encodeValue(t) {
		return G_(t)
	}
	decodeKey(t) {
		return decodeURIComponent(t)
	}
	decodeValue(t) {
		return decodeURIComponent(t)
	}
}
function qN(e, t) {
	let n = new Map()
	return (
		e.length > 0 &&
			e
				.replace(/^\?/, '')
				.split('&')
				.forEach((i) => {
					let o = i.indexOf('='),
						[s, a] =
							o == -1
								? [t.decodeKey(i), '']
								: [t.decodeKey(i.slice(0, o)), t.decodeValue(i.slice(o + 1))],
						c = n.get(s) || []
					c.push(a), n.set(s, c)
				}),
		n
	)
}
var KN = /%(\d[a-f0-9])/gi,
	YN = {
		40: '@',
		'3A': ':',
		24: '$',
		'2C': ',',
		'3B': ';',
		'3D': '=',
		'3F': '?',
		'2F': '/',
	}
function G_(e) {
	return encodeURIComponent(e).replace(KN, (t, n) => YN[n] ?? t)
}
function Cc(e) {
	return `${e}`
}
var Nn = class e {
	map
	encoder
	updates = null
	cloneFrom = null
	constructor(t = {}) {
		if (((this.encoder = t.encoder || new ih()), t.fromString)) {
			if (t.fromObject) throw new w(2805, !1)
			this.map = qN(t.fromString, this.encoder)
		} else
			t.fromObject
				? ((this.map = new Map()),
				  Object.keys(t.fromObject).forEach((n) => {
						let r = t.fromObject[n],
							i = Array.isArray(r) ? r.map(Cc) : [Cc(r)]
						this.map.set(n, i)
				  }))
				: (this.map = null)
	}
	has(t) {
		return this.init(), this.map.has(t)
	}
	get(t) {
		this.init()
		let n = this.map.get(t)
		return n ? n[0] : null
	}
	getAll(t) {
		return this.init(), this.map.get(t) || null
	}
	keys() {
		return this.init(), Array.from(this.map.keys())
	}
	append(t, n) {
		return this.clone({ param: t, value: n, op: 'a' })
	}
	appendAll(t) {
		let n = []
		return (
			Object.keys(t).forEach((r) => {
				let i = t[r]
				Array.isArray(i)
					? i.forEach((o) => {
							n.push({ param: r, value: o, op: 'a' })
					  })
					: n.push({ param: r, value: i, op: 'a' })
			}),
			this.clone(n)
		)
	}
	set(t, n) {
		return this.clone({ param: t, value: n, op: 's' })
	}
	delete(t, n) {
		return this.clone({ param: t, value: n, op: 'd' })
	}
	toString() {
		return (
			this.init(),
			this.keys()
				.map((t) => {
					let n = this.encoder.encodeKey(t)
					return this.map
						.get(t)
						.map((r) => n + '=' + this.encoder.encodeValue(r))
						.join('&')
				})
				.filter((t) => t !== '')
				.join('&')
		)
	}
	clone(t) {
		let n = new e({ encoder: this.encoder })
		return (
			(n.cloneFrom = this.cloneFrom || this),
			(n.updates = (this.updates || []).concat(t)),
			n
		)
	}
	init() {
		this.map === null && (this.map = new Map()),
			this.cloneFrom !== null &&
				(this.cloneFrom.init(),
				this.cloneFrom
					.keys()
					.forEach((t) => this.map.set(t, this.cloneFrom.map.get(t))),
				this.updates.forEach((t) => {
					switch (t.op) {
						case 'a':
						case 's':
							let n = (t.op === 'a' ? this.map.get(t.param) : void 0) || []
							n.push(Cc(t.value)), this.map.set(t.param, n)
							break
						case 'd':
							if (t.value !== void 0) {
								let r = this.map.get(t.param) || [],
									i = r.indexOf(Cc(t.value))
								i !== -1 && r.splice(i, 1),
									r.length > 0
										? this.map.set(t.param, r)
										: this.map.delete(t.param)
							} else {
								this.map.delete(t.param)
								break
							}
					}
				}),
				(this.cloneFrom = this.updates = null))
	}
}
var oh = class {
	map = new Map()
	set(t, n) {
		return this.map.set(t, n), this
	}
	get(t) {
		return this.map.has(t) || this.map.set(t, t.defaultValue()), this.map.get(t)
	}
	delete(t) {
		return this.map.delete(t), this
	}
	has(t) {
		return this.map.has(t)
	}
	keys() {
		return this.map.keys()
	}
}
function ZN(e) {
	switch (e) {
		case 'DELETE':
		case 'GET':
		case 'HEAD':
		case 'OPTIONS':
		case 'JSONP':
			return !1
		default:
			return !0
	}
}
function q_(e) {
	return typeof ArrayBuffer < 'u' && e instanceof ArrayBuffer
}
function K_(e) {
	return typeof Blob < 'u' && e instanceof Blob
}
function Y_(e) {
	return typeof FormData < 'u' && e instanceof FormData
}
function QN(e) {
	return typeof URLSearchParams < 'u' && e instanceof URLSearchParams
}
var yo = 'Content-Type',
	Tc = 'Accept',
	uh = 'X-Request-URL',
	tI = 'text/plain',
	nI = 'application/json',
	rI = `${nI}, ${tI}, */*`,
	Eo = class e {
		url
		body = null
		headers
		context
		reportProgress = !1
		withCredentials = !1
		responseType = 'json'
		method
		params
		urlWithParams
		transferCache
		constructor(t, n, r, i) {
			;(this.url = n), (this.method = t.toUpperCase())
			let o
			if (
				(ZN(this.method) || i
					? ((this.body = r !== void 0 ? r : null), (o = i))
					: (o = r),
				o &&
					((this.reportProgress = !!o.reportProgress),
					(this.withCredentials = !!o.withCredentials),
					o.responseType && (this.responseType = o.responseType),
					o.headers && (this.headers = o.headers),
					o.context && (this.context = o.context),
					o.params && (this.params = o.params),
					(this.transferCache = o.transferCache)),
				(this.headers ??= new Rt()),
				(this.context ??= new oh()),
				!this.params)
			)
				(this.params = new Nn()), (this.urlWithParams = n)
			else {
				let s = this.params.toString()
				if (s.length === 0) this.urlWithParams = n
				else {
					let a = n.indexOf('?'),
						c = a === -1 ? '?' : a < n.length - 1 ? '&' : ''
					this.urlWithParams = n + c + s
				}
			}
		}
		serializeBody() {
			return this.body === null
				? null
				: typeof this.body == 'string' ||
				  q_(this.body) ||
				  K_(this.body) ||
				  Y_(this.body) ||
				  QN(this.body)
				? this.body
				: this.body instanceof Nn
				? this.body.toString()
				: typeof this.body == 'object' ||
				  typeof this.body == 'boolean' ||
				  Array.isArray(this.body)
				? JSON.stringify(this.body)
				: this.body.toString()
		}
		detectContentTypeHeader() {
			return this.body === null || Y_(this.body)
				? null
				: K_(this.body)
				? this.body.type || null
				: q_(this.body)
				? null
				: typeof this.body == 'string'
				? tI
				: this.body instanceof Nn
				? 'application/x-www-form-urlencoded;charset=UTF-8'
				: typeof this.body == 'object' ||
				  typeof this.body == 'number' ||
				  typeof this.body == 'boolean'
				? nI
				: null
		}
		clone(t = {}) {
			let n = t.method || this.method,
				r = t.url || this.url,
				i = t.responseType || this.responseType,
				o = t.transferCache ?? this.transferCache,
				s = t.body !== void 0 ? t.body : this.body,
				a = t.withCredentials ?? this.withCredentials,
				c = t.reportProgress ?? this.reportProgress,
				u = t.headers || this.headers,
				l = t.params || this.params,
				d = t.context ?? this.context
			return (
				t.setHeaders !== void 0 &&
					(u = Object.keys(t.setHeaders).reduce(
						(h, f) => h.set(f, t.setHeaders[f]),
						u
					)),
				t.setParams &&
					(l = Object.keys(t.setParams).reduce(
						(h, f) => h.set(f, t.setParams[f]),
						l
					)),
				new e(n, r, s, {
					params: l,
					headers: u,
					context: d,
					reportProgress: c,
					responseType: i,
					withCredentials: a,
					transferCache: o,
				})
			)
		}
	},
	On = (function (e) {
		return (
			(e[(e.Sent = 0)] = 'Sent'),
			(e[(e.UploadProgress = 1)] = 'UploadProgress'),
			(e[(e.ResponseHeader = 2)] = 'ResponseHeader'),
			(e[(e.DownloadProgress = 3)] = 'DownloadProgress'),
			(e[(e.Response = 4)] = 'Response'),
			(e[(e.User = 5)] = 'User'),
			e
		)
	})(On || {}),
	wo = class {
		headers
		status
		statusText
		url
		ok
		type
		constructor(t, n = 200, r = 'OK') {
			;(this.headers = t.headers || new Rt()),
				(this.status = t.status !== void 0 ? t.status : n),
				(this.statusText = t.statusText || r),
				(this.url = t.url || null),
				(this.ok = this.status >= 200 && this.status < 300)
		}
	},
	Sc = class e extends wo {
		constructor(t = {}) {
			super(t)
		}
		type = On.ResponseHeader
		clone(t = {}) {
			return new e({
				headers: t.headers || this.headers,
				status: t.status !== void 0 ? t.status : this.status,
				statusText: t.statusText || this.statusText,
				url: t.url || this.url || void 0,
			})
		}
	},
	ur = class e extends wo {
		body
		constructor(t = {}) {
			super(t), (this.body = t.body !== void 0 ? t.body : null)
		}
		type = On.Response
		clone(t = {}) {
			return new e({
				body: t.body !== void 0 ? t.body : this.body,
				headers: t.headers || this.headers,
				status: t.status !== void 0 ? t.status : this.status,
				statusText: t.statusText || this.statusText,
				url: t.url || this.url || void 0,
			})
		}
	},
	Rn = class extends wo {
		name = 'HttpErrorResponse'
		message
		error
		ok = !1
		constructor(t) {
			super(t, 0, 'Unknown Error'),
				this.status >= 200 && this.status < 300
					? (this.message = `Http failure during parsing for ${
							t.url || '(unknown url)'
					  }`)
					: (this.message = `Http failure response for ${
							t.url || '(unknown url)'
					  }: ${t.status} ${t.statusText}`),
				(this.error = t.error || null)
		}
	},
	iI = 200,
	JN = 204
function nh(e, t) {
	return {
		body: t,
		headers: e.headers,
		context: e.context,
		observe: e.observe,
		params: e.params,
		reportProgress: e.reportProgress,
		responseType: e.responseType,
		withCredentials: e.withCredentials,
		transferCache: e.transferCache,
	}
}
var Do = (() => {
		class e {
			handler
			constructor(n) {
				this.handler = n
			}
			request(n, r, i = {}) {
				let o
				if (n instanceof Eo) o = n
				else {
					let c
					i.headers instanceof Rt ? (c = i.headers) : (c = new Rt(i.headers))
					let u
					i.params &&
						(i.params instanceof Nn
							? (u = i.params)
							: (u = new Nn({ fromObject: i.params }))),
						(o = new Eo(n, r, i.body !== void 0 ? i.body : null, {
							headers: c,
							context: i.context,
							params: u,
							reportProgress: i.reportProgress,
							responseType: i.responseType || 'json',
							withCredentials: i.withCredentials,
							transferCache: i.transferCache,
						}))
				}
				let s = C(o).pipe(Ut((c) => this.handler.handle(c)))
				if (n instanceof Eo || i.observe === 'events') return s
				let a = s.pipe(Me((c) => c instanceof ur))
				switch (i.observe || 'body') {
					case 'body':
						switch (o.responseType) {
							case 'arraybuffer':
								return a.pipe(
									k((c) => {
										if (c.body !== null && !(c.body instanceof ArrayBuffer))
											throw new w(2806, !1)
										return c.body
									})
								)
							case 'blob':
								return a.pipe(
									k((c) => {
										if (c.body !== null && !(c.body instanceof Blob))
											throw new w(2807, !1)
										return c.body
									})
								)
							case 'text':
								return a.pipe(
									k((c) => {
										if (c.body !== null && typeof c.body != 'string')
											throw new w(2808, !1)
										return c.body
									})
								)
							case 'json':
							default:
								return a.pipe(k((c) => c.body))
						}
					case 'response':
						return a
					default:
						throw new w(2809, !1)
				}
			}
			delete(n, r = {}) {
				return this.request('DELETE', n, r)
			}
			get(n, r = {}) {
				return this.request('GET', n, r)
			}
			head(n, r = {}) {
				return this.request('HEAD', n, r)
			}
			jsonp(n, r) {
				return this.request('JSONP', n, {
					params: new Nn().append(r, 'JSONP_CALLBACK'),
					observe: 'body',
					responseType: 'json',
				})
			}
			options(n, r = {}) {
				return this.request('OPTIONS', n, r)
			}
			patch(n, r, i = {}) {
				return this.request('PATCH', n, nh(i, r))
			}
			post(n, r, i = {}) {
				return this.request('POST', n, nh(i, r))
			}
			put(n, r, i = {}) {
				return this.request('PUT', n, nh(i, r))
			}
			static ɵfac = function (r) {
				return new (r || e)(I(_o))
			}
			static ɵprov = _({ token: e, factory: e.ɵfac })
		}
		return e
	})(),
	XN = /^\)\]\}',?\n/
function Z_(e) {
	if (e.url) return e.url
	let t = uh.toLocaleLowerCase()
	return e.headers.get(t)
}
var oI = new E(''),
	rh = (() => {
		class e {
			fetchImpl =
				g(sh, { optional: !0 })?.fetch ?? ((...n) => globalThis.fetch(...n))
			ngZone = g(j)
			handle(n) {
				return new P((r) => {
					let i = new AbortController()
					return (
						this.doRequest(n, i.signal, r).then(ah, (o) =>
							r.error(new Rn({ error: o }))
						),
						() => i.abort()
					)
				})
			}
			doRequest(n, r, i) {
				return p(this, null, function* () {
					let o = this.createRequestInit(n),
						s
					try {
						let f = this.ngZone.runOutsideAngular(() =>
							this.fetchImpl(n.urlWithParams, y({ signal: r }, o))
						)
						eO(f), i.next({ type: On.Sent }), (s = yield f)
					} catch (f) {
						i.error(
							new Rn({
								error: f,
								status: f.status ?? 0,
								statusText: f.statusText,
								url: n.urlWithParams,
								headers: f.headers,
							})
						)
						return
					}
					let a = new Rt(s.headers),
						c = s.statusText,
						u = Z_(s) ?? n.urlWithParams,
						l = s.status,
						d = null
					if (
						(n.reportProgress &&
							i.next(new Sc({ headers: a, status: l, statusText: c, url: u })),
						s.body)
					) {
						let f = s.headers.get('content-length'),
							m = [],
							v = s.body.getReader(),
							D = 0,
							T,
							ce,
							W = typeof Zone < 'u' && Zone.current
						yield this.ngZone.runOutsideAngular(() =>
							p(this, null, function* () {
								for (;;) {
									let { done: vt, value: Vt } = yield v.read()
									if (vt) break
									if ((m.push(Vt), (D += Vt.length), n.reportProgress)) {
										ce =
											n.responseType === 'text'
												? (ce ?? '') +
												  (T ??= new TextDecoder()).decode(Vt, { stream: !0 })
												: void 0
										let Ui = () =>
											i.next({
												type: On.DownloadProgress,
												total: f ? +f : void 0,
												loaded: D,
												partialText: ce,
											})
										W ? W.run(Ui) : Ui()
									}
								}
							})
						)
						let mt = this.concatChunks(m, D)
						try {
							let vt = s.headers.get(yo) ?? ''
							d = this.parseBody(n, mt, vt)
						} catch (vt) {
							i.error(
								new Rn({
									error: vt,
									headers: new Rt(s.headers),
									status: s.status,
									statusText: s.statusText,
									url: Z_(s) ?? n.urlWithParams,
								})
							)
							return
						}
					}
					l === 0 && (l = d ? iI : 0),
						l >= 200 && l < 300
							? (i.next(
									new ur({
										body: d,
										headers: a,
										status: l,
										statusText: c,
										url: u,
									})
							  ),
							  i.complete())
							: i.error(
									new Rn({
										error: d,
										headers: a,
										status: l,
										statusText: c,
										url: u,
									})
							  )
				})
			}
			parseBody(n, r, i) {
				switch (n.responseType) {
					case 'json':
						let o = new TextDecoder().decode(r).replace(XN, '')
						return o === '' ? null : JSON.parse(o)
					case 'text':
						return new TextDecoder().decode(r)
					case 'blob':
						return new Blob([r], { type: i })
					case 'arraybuffer':
						return r.buffer
				}
			}
			createRequestInit(n) {
				let r = {},
					i = n.withCredentials ? 'include' : void 0
				if (
					(n.headers.forEach((o, s) => (r[o] = s.join(','))),
					n.headers.has(Tc) || (r[Tc] = rI),
					!n.headers.has(yo))
				) {
					let o = n.detectContentTypeHeader()
					o !== null && (r[yo] = o)
				}
				return {
					body: n.serializeBody(),
					method: n.method,
					headers: r,
					credentials: i,
				}
			}
			concatChunks(n, r) {
				let i = new Uint8Array(r),
					o = 0
				for (let s of n) i.set(s, o), (o += s.length)
				return i
			}
			static ɵfac = function (r) {
				return new (r || e)()
			}
			static ɵprov = _({ token: e, factory: e.ɵfac })
		}
		return e
	})(),
	sh = class {}
function ah() {}
function eO(e) {
	e.then(ah, ah)
}
function sI(e, t) {
	return t(e)
}
function tO(e, t) {
	return (n, r) => t.intercept(n, { handle: (i) => e(i, r) })
}
function nO(e, t, n) {
	return (r, i) => he(n, () => t(r, (o) => e(o, i)))
}
var lh = new E(''),
	dh = new E(''),
	aI = new E(''),
	cI = new E('', { providedIn: 'root', factory: () => !0 })
function rO() {
	let e = null
	return (t, n) => {
		e === null && (e = (g(lh, { optional: !0 }) ?? []).reduceRight(tO, sI))
		let r = g(Ke)
		if (g(cI)) {
			let o = r.add()
			return e(t, n).pipe(pn(() => r.remove(o)))
		} else return e(t, n)
	}
}
var Q_ = (() => {
	class e extends _o {
		backend
		injector
		chain = null
		pendingTasks = g(Ke)
		contributeToStability = g(cI)
		constructor(n, r) {
			super(), (this.backend = n), (this.injector = r)
		}
		handle(n) {
			if (this.chain === null) {
				let r = Array.from(
					new Set([...this.injector.get(dh), ...this.injector.get(aI, [])])
				)
				this.chain = r.reduceRight((i, o) => nO(i, o, this.injector), sI)
			}
			if (this.contributeToStability) {
				let r = this.pendingTasks.add()
				return this.chain(n, (i) => this.backend.handle(i)).pipe(
					pn(() => this.pendingTasks.remove(r))
				)
			} else return this.chain(n, (r) => this.backend.handle(r))
		}
		static ɵfac = function (r) {
			return new (r || e)(I(Io), I(fe))
		}
		static ɵprov = _({ token: e, factory: e.ɵfac })
	}
	return e
})()
var iO = /^\)\]\}',?\n/,
	oO = RegExp(`^${uh}:`, 'm')
function sO(e) {
	return 'responseURL' in e && e.responseURL
		? e.responseURL
		: oO.test(e.getAllResponseHeaders())
		? e.getResponseHeader(uh)
		: null
}
var J_ = (() => {
		class e {
			xhrFactory
			constructor(n) {
				this.xhrFactory = n
			}
			handle(n) {
				if (n.method === 'JSONP') throw new w(-2800, !1)
				let r = this.xhrFactory
				return (r.ɵloadImpl ? Z(r.ɵloadImpl()) : C(null)).pipe(
					Re(
						() =>
							new P((o) => {
								let s = r.build()
								if (
									(s.open(n.method, n.urlWithParams),
									n.withCredentials && (s.withCredentials = !0),
									n.headers.forEach((v, D) =>
										s.setRequestHeader(v, D.join(','))
									),
									n.headers.has(Tc) || s.setRequestHeader(Tc, rI),
									!n.headers.has(yo))
								) {
									let v = n.detectContentTypeHeader()
									v !== null && s.setRequestHeader(yo, v)
								}
								if (n.responseType) {
									let v = n.responseType.toLowerCase()
									s.responseType = v !== 'json' ? v : 'text'
								}
								let a = n.serializeBody(),
									c = null,
									u = () => {
										if (c !== null) return c
										let v = s.statusText || 'OK',
											D = new Rt(s.getAllResponseHeaders()),
											T = sO(s) || n.url
										return (
											(c = new Sc({
												headers: D,
												status: s.status,
												statusText: v,
												url: T,
											})),
											c
										)
									},
									l = () => {
										let { headers: v, status: D, statusText: T, url: ce } = u(),
											W = null
										D !== JN &&
											(W =
												typeof s.response > 'u' ? s.responseText : s.response),
											D === 0 && (D = W ? iI : 0)
										let mt = D >= 200 && D < 300
										if (n.responseType === 'json' && typeof W == 'string') {
											let vt = W
											W = W.replace(iO, '')
											try {
												W = W !== '' ? JSON.parse(W) : null
											} catch (Vt) {
												;(W = vt),
													mt && ((mt = !1), (W = { error: Vt, text: W }))
											}
										}
										mt
											? (o.next(
													new ur({
														body: W,
														headers: v,
														status: D,
														statusText: T,
														url: ce || void 0,
													})
											  ),
											  o.complete())
											: o.error(
													new Rn({
														error: W,
														headers: v,
														status: D,
														statusText: T,
														url: ce || void 0,
													})
											  )
									},
									d = (v) => {
										let { url: D } = u(),
											T = new Rn({
												error: v,
												status: s.status || 0,
												statusText: s.statusText || 'Unknown Error',
												url: D || void 0,
											})
										o.error(T)
									},
									h = !1,
									f = (v) => {
										h || (o.next(u()), (h = !0))
										let D = { type: On.DownloadProgress, loaded: v.loaded }
										v.lengthComputable && (D.total = v.total),
											n.responseType === 'text' &&
												s.responseText &&
												(D.partialText = s.responseText),
											o.next(D)
									},
									m = (v) => {
										let D = { type: On.UploadProgress, loaded: v.loaded }
										v.lengthComputable && (D.total = v.total), o.next(D)
									}
								return (
									s.addEventListener('load', l),
									s.addEventListener('error', d),
									s.addEventListener('timeout', d),
									s.addEventListener('abort', d),
									n.reportProgress &&
										(s.addEventListener('progress', f),
										a !== null &&
											s.upload &&
											s.upload.addEventListener('progress', m)),
									s.send(a),
									o.next({ type: On.Sent }),
									() => {
										s.removeEventListener('error', d),
											s.removeEventListener('abort', d),
											s.removeEventListener('load', l),
											s.removeEventListener('timeout', d),
											n.reportProgress &&
												(s.removeEventListener('progress', f),
												a !== null &&
													s.upload &&
													s.upload.removeEventListener('progress', m)),
											s.readyState !== s.DONE && s.abort()
									}
								)
							})
					)
				)
			}
			static ɵfac = function (r) {
				return new (r || e)(I(hi))
			}
			static ɵprov = _({ token: e, factory: e.ɵfac })
		}
		return e
	})(),
	uI = new E(''),
	aO = 'XSRF-TOKEN',
	cO = new E('', { providedIn: 'root', factory: () => aO }),
	uO = 'X-XSRF-TOKEN',
	lO = new E('', { providedIn: 'root', factory: () => uO }),
	Ac = class {},
	dO = (() => {
		class e {
			doc
			platform
			cookieName
			lastCookieString = ''
			lastToken = null
			parseCount = 0
			constructor(n, r, i) {
				;(this.doc = n), (this.platform = r), (this.cookieName = i)
			}
			getToken() {
				if (this.platform === 'server') return null
				let n = this.doc.cookie || ''
				return (
					n !== this.lastCookieString &&
						(this.parseCount++,
						(this.lastToken = bc(n, this.cookieName)),
						(this.lastCookieString = n)),
					this.lastToken
				)
			}
			static ɵfac = function (r) {
				return new (r || e)(I(_e), I(ye), I(cO))
			}
			static ɵprov = _({ token: e, factory: e.ɵfac })
		}
		return e
	})()
function fO(e, t) {
	let n = e.url.toLowerCase()
	if (
		!g(uI) ||
		e.method === 'GET' ||
		e.method === 'HEAD' ||
		n.startsWith('http://') ||
		n.startsWith('https://')
	)
		return t(e)
	let r = g(Ac).getToken(),
		i = g(lO)
	return (
		r != null &&
			!e.headers.has(i) &&
			(e = e.clone({ headers: e.headers.set(i, r) })),
		t(e)
	)
}
var fh = (function (e) {
	return (
		(e[(e.Interceptors = 0)] = 'Interceptors'),
		(e[(e.LegacyInterceptors = 1)] = 'LegacyInterceptors'),
		(e[(e.CustomXsrfConfiguration = 2)] = 'CustomXsrfConfiguration'),
		(e[(e.NoXsrfProtection = 3)] = 'NoXsrfProtection'),
		(e[(e.JsonpSupport = 4)] = 'JsonpSupport'),
		(e[(e.RequestsMadeViaParent = 5)] = 'RequestsMadeViaParent'),
		(e[(e.Fetch = 6)] = 'Fetch'),
		e
	)
})(fh || {})
function lI(e, t) {
	return { ɵkind: e, ɵproviders: t }
}
function dI(...e) {
	let t = [
		Do,
		J_,
		Q_,
		{ provide: _o, useExisting: Q_ },
		{ provide: Io, useFactory: () => g(oI, { optional: !0 }) ?? g(J_) },
		{ provide: dh, useValue: fO, multi: !0 },
		{ provide: uI, useValue: !0 },
		{ provide: Ac, useClass: dO },
	]
	for (let n of e) t.push(...n.ɵproviders)
	return qe(t)
}
var X_ = new E('')
function fI() {
	return lI(fh.LegacyInterceptors, [
		{ provide: X_, useFactory: rO },
		{ provide: dh, useExisting: X_, multi: !0 },
	])
}
function hI() {
	return lI(fh.Fetch, [
		rh,
		{ provide: oI, useExisting: rh },
		{ provide: Io, useExisting: rh },
	])
}
var hO = new E(''),
	pO = 'b',
	gO = 'h',
	mO = 's',
	vO = 'st',
	yO = 'u',
	EO = 'rt',
	ch = new E(''),
	_O = ['GET', 'HEAD']
function IO(e, t) {
	let h = g(ch),
		{ isCacheActive: n } = h,
		r = Ag(h, ['isCacheActive']),
		{ transferCache: i, method: o } = e
	if (
		!n ||
		i === !1 ||
		(o === 'POST' && !r.includePostRequests && !i) ||
		(o !== 'POST' && !_O.includes(o)) ||
		(!r.includeRequestsWithAuthHeaders && wO(e)) ||
		r.filter?.(e) === !1
	)
		return t(e)
	let s = g(ai)
	if (g(hO, { optional: !0 })) throw new w(2803, !1)
	let c = e.url,
		u = DO(e, c),
		l = s.get(u, null),
		d = r.includeHeaders
	if ((typeof i == 'object' && i.includeHeaders && (d = i.includeHeaders), l)) {
		let { [pO]: f, [EO]: m, [gO]: v, [mO]: D, [vO]: T, [yO]: ce } = l,
			W = f
		switch (m) {
			case 'arraybuffer':
				W = new TextEncoder().encode(f).buffer
				break
			case 'blob':
				W = new Blob([f])
				break
		}
		let mt = new Rt(v)
		return C(
			new ur({ body: W, headers: mt, status: D, statusText: T, url: ce })
		)
	}
	return t(e).pipe(
		J((f) => {
			f instanceof ur
		})
	)
}
function wO(e) {
	return e.headers.has('authorization') || e.headers.has('proxy-authorization')
}
function eI(e) {
	return [...e.keys()]
		.sort()
		.map((t) => `${t}=${e.getAll(t)}`)
		.join('&')
}
function DO(e, t) {
	let { params: n, method: r, responseType: i } = e,
		o = eI(n),
		s = e.serializeBody()
	s instanceof URLSearchParams ? (s = eI(s)) : typeof s != 'string' && (s = '')
	let a = [r, i, t, s, o].join('|'),
		c = bO(a)
	return c
}
function bO(e) {
	let t = 0
	for (let n of e) t = (Math.imul(31, t) + n.charCodeAt(0)) << 0
	return (t += 2147483648), t.toString()
}
function pI(e) {
	return [
		{
			provide: ch,
			useFactory: () => (
				wn('NgHttpTransferCache'), y({ isCacheActive: !0 }, e)
			),
		},
		{ provide: aI, useValue: IO, multi: !0 },
		{
			provide: Tn,
			multi: !0,
			useFactory: () => {
				let t = g(ve),
					n = g(ch)
				return () => {
					t.whenStable().then(() => {
						n.isCacheActive = !1
					})
				}
			},
		},
	]
}
var ph = class extends Dc {
		supportsDOMEvents = !0
	},
	gh = class e extends ph {
		static makeCurrent() {
			V_(new e())
		}
		onAndCancel(t, n, r, i) {
			return (
				t.addEventListener(n, r, i),
				() => {
					t.removeEventListener(n, r, i)
				}
			)
		}
		dispatchEvent(t, n) {
			t.dispatchEvent(n)
		}
		remove(t) {
			t.remove()
		}
		createElement(t, n) {
			return (n = n || this.getDefaultDocument()), n.createElement(t)
		}
		createHtmlDocument() {
			return document.implementation.createHTMLDocument('fakeTitle')
		}
		getDefaultDocument() {
			return document
		}
		isElementNode(t) {
			return t.nodeType === Node.ELEMENT_NODE
		}
		isShadowRoot(t) {
			return t instanceof DocumentFragment
		}
		getGlobalEventTarget(t, n) {
			return n === 'window'
				? window
				: n === 'document'
				? t
				: n === 'body'
				? t.body
				: null
		}
		getBaseHref(t) {
			let n = CO()
			return n == null ? null : TO(n)
		}
		resetBaseElement() {
			bo = null
		}
		getUserAgent() {
			return window.navigator.userAgent
		}
		getCookie(t) {
			return bc(document.cookie, t)
		}
	},
	bo = null
function CO() {
	return (
		(bo = bo || document.querySelector('base')),
		bo ? bo.getAttribute('href') : null
	)
}
function TO(e) {
	return new URL(e, document.baseURI).pathname
}
var mh = class {
		addToWindow(t) {
			;(_t.getAngularTestability = (r, i = !0) => {
				let o = t.findTestabilityInTree(r, i)
				if (o == null) throw new w(5103, !1)
				return o
			}),
				(_t.getAllAngularTestabilities = () => t.getAllTestabilities()),
				(_t.getAllAngularRootElements = () => t.getAllRootElements())
			let n = (r) => {
				let i = _t.getAllAngularTestabilities(),
					o = i.length,
					s = function () {
						o--, o == 0 && r()
					}
				i.forEach((a) => {
					a.whenStable(s)
				})
			}
			_t.frameworkStabilizers || (_t.frameworkStabilizers = []),
				_t.frameworkStabilizers.push(n)
		}
		findTestabilityInTree(t, n, r) {
			if (n == null) return null
			let i = t.getTestability(n)
			return (
				i ??
				(r
					? At().isShadowRoot(n)
						? this.findTestabilityInTree(t, n.host, !0)
						: this.findTestabilityInTree(t, n.parentElement, !0)
					: null)
			)
		}
	},
	SO = (() => {
		class e {
			build() {
				return new XMLHttpRequest()
			}
			static ɵfac = function (r) {
				return new (r || e)()
			}
			static ɵprov = _({ token: e, factory: e.ɵfac })
		}
		return e
	})(),
	vh = new E(''),
	II = (() => {
		class e {
			_zone
			_plugins
			_eventNameToPlugin = new Map()
			constructor(n, r) {
				;(this._zone = r),
					n.forEach((i) => {
						i.manager = this
					}),
					(this._plugins = n.slice().reverse())
			}
			addEventListener(n, r, i, o) {
				return this._findPluginFor(r).addEventListener(n, r, i, o)
			}
			getZone() {
				return this._zone
			}
			_findPluginFor(n) {
				let r = this._eventNameToPlugin.get(n)
				if (r) return r
				if (((r = this._plugins.find((o) => o.supports(n))), !r))
					throw new w(5101, !1)
				return this._eventNameToPlugin.set(n, r), r
			}
			static ɵfac = function (r) {
				return new (r || e)(I(vh), I(j))
			}
			static ɵprov = _({ token: e, factory: e.ɵfac })
		}
		return e
	})(),
	Rc = class {
		_doc
		constructor(t) {
			this._doc = t
		}
		manager
	},
	Mc = 'ng-app-id'
function mI(e) {
	for (let t of e) t.remove()
}
function vI(e, t) {
	let n = t.createElement('style')
	return (n.textContent = e), n
}
function AO(e, t, n, r) {
	let i = e.head?.querySelectorAll(`style[${Mc}="${t}"],link[${Mc}="${t}"]`)
	if (i)
		for (let o of i)
			o.removeAttribute(Mc),
				o instanceof HTMLLinkElement
					? r.set(o.href.slice(o.href.lastIndexOf('/') + 1), {
							usage: 0,
							elements: [o],
					  })
					: o.textContent && n.set(o.textContent, { usage: 0, elements: [o] })
}
function yh(e, t) {
	let n = t.createElement('link')
	return n.setAttribute('rel', 'stylesheet'), n.setAttribute('href', e), n
}
var wI = (() => {
		class e {
			doc
			appId
			nonce
			inline = new Map()
			external = new Map()
			hosts = new Set()
			isServer
			constructor(n, r, i, o = {}) {
				;(this.doc = n),
					(this.appId = r),
					(this.nonce = i),
					(this.isServer = th(o)),
					AO(n, r, this.inline, this.external),
					this.hosts.add(n.head)
			}
			addStyles(n, r) {
				for (let i of n) this.addUsage(i, this.inline, vI)
				r?.forEach((i) => this.addUsage(i, this.external, yh))
			}
			removeStyles(n, r) {
				for (let i of n) this.removeUsage(i, this.inline)
				r?.forEach((i) => this.removeUsage(i, this.external))
			}
			addUsage(n, r, i) {
				let o = r.get(n)
				o
					? o.usage++
					: r.set(n, {
							usage: 1,
							elements: [...this.hosts].map((s) =>
								this.addElement(s, i(n, this.doc))
							),
					  })
			}
			removeUsage(n, r) {
				let i = r.get(n)
				i && (i.usage--, i.usage <= 0 && (mI(i.elements), r.delete(n)))
			}
			ngOnDestroy() {
				for (let [, { elements: n }] of [...this.inline, ...this.external])
					mI(n)
				this.hosts.clear()
			}
			addHost(n) {
				this.hosts.add(n)
				for (let [r, { elements: i }] of this.inline)
					i.push(this.addElement(n, vI(r, this.doc)))
				for (let [r, { elements: i }] of this.external)
					i.push(this.addElement(n, yh(r, this.doc)))
			}
			removeHost(n) {
				this.hosts.delete(n)
			}
			addElement(n, r) {
				return (
					this.nonce && r.setAttribute('nonce', this.nonce),
					this.isServer && r.setAttribute(Mc, this.appId),
					n.appendChild(r)
				)
			}
			static ɵfac = function (r) {
				return new (r || e)(I(_e), I(tr), I(cf, 8), I(ye))
			}
			static ɵprov = _({ token: e, factory: e.ɵfac })
		}
		return e
	})(),
	hh = {
		svg: 'http://www.w3.org/2000/svg',
		xhtml: 'http://www.w3.org/1999/xhtml',
		xlink: 'http://www.w3.org/1999/xlink',
		xml: 'http://www.w3.org/XML/1998/namespace',
		xmlns: 'http://www.w3.org/2000/xmlns/',
		math: 'http://www.w3.org/1998/Math/MathML',
	},
	_h = /%COMP%/g
var DI = '%COMP%',
	MO = `_nghost-${DI}`,
	RO = `_ngcontent-${DI}`,
	NO = !0,
	OO = new E('', { providedIn: 'root', factory: () => NO })
function kO(e) {
	return RO.replace(_h, e)
}
function xO(e) {
	return MO.replace(_h, e)
}
function bI(e, t) {
	return t.map((n) => n.replace(_h, e))
}
var yI = (() => {
		class e {
			eventManager
			sharedStylesHost
			appId
			removeStylesOnCompDestroy
			doc
			platformId
			ngZone
			nonce
			tracingService
			rendererByCompId = new Map()
			defaultRenderer
			platformIsServer
			constructor(n, r, i, o, s, a, c, u = null, l = null) {
				;(this.eventManager = n),
					(this.sharedStylesHost = r),
					(this.appId = i),
					(this.removeStylesOnCompDestroy = o),
					(this.doc = s),
					(this.platformId = a),
					(this.ngZone = c),
					(this.nonce = u),
					(this.tracingService = l),
					(this.platformIsServer = th(a)),
					(this.defaultRenderer = new Co(
						n,
						s,
						c,
						this.platformIsServer,
						this.tracingService
					))
			}
			createRenderer(n, r) {
				if (!n || !r) return this.defaultRenderer
				this.platformIsServer &&
					r.encapsulation === bt.ShadowDom &&
					(r = L(y({}, r), { encapsulation: bt.Emulated }))
				let i = this.getOrCreateRenderer(n, r)
				return (
					i instanceof Nc
						? i.applyToHost(n)
						: i instanceof To && i.applyStyles(),
					i
				)
			}
			getOrCreateRenderer(n, r) {
				let i = this.rendererByCompId,
					o = i.get(r.id)
				if (!o) {
					let s = this.doc,
						a = this.ngZone,
						c = this.eventManager,
						u = this.sharedStylesHost,
						l = this.removeStylesOnCompDestroy,
						d = this.platformIsServer,
						h = this.tracingService
					switch (r.encapsulation) {
						case bt.Emulated:
							o = new Nc(c, u, r, this.appId, l, s, a, d, h)
							break
						case bt.ShadowDom:
							return new Eh(c, u, n, r, s, a, this.nonce, d, h)
						default:
							o = new To(c, u, r, l, s, a, d, h)
							break
					}
					i.set(r.id, o)
				}
				return o
			}
			ngOnDestroy() {
				this.rendererByCompId.clear()
			}
			componentReplaced(n) {
				this.rendererByCompId.delete(n)
			}
			static ɵfac = function (r) {
				return new (r || e)(
					I(II),
					I(wI),
					I(tr),
					I(OO),
					I(_e),
					I(ye),
					I(j),
					I(cf),
					I(ci, 8)
				)
			}
			static ɵprov = _({ token: e, factory: e.ɵfac })
		}
		return e
	})(),
	Co = class {
		eventManager
		doc
		ngZone
		platformIsServer
		tracingService
		data = Object.create(null)
		throwOnSyntheticProps = !0
		constructor(t, n, r, i, o) {
			;(this.eventManager = t),
				(this.doc = n),
				(this.ngZone = r),
				(this.platformIsServer = i),
				(this.tracingService = o)
		}
		destroy() {}
		destroyNode = null
		createElement(t, n) {
			return n
				? this.doc.createElementNS(hh[n] || n, t)
				: this.doc.createElement(t)
		}
		createComment(t) {
			return this.doc.createComment(t)
		}
		createText(t) {
			return this.doc.createTextNode(t)
		}
		appendChild(t, n) {
			;(EI(t) ? t.content : t).appendChild(n)
		}
		insertBefore(t, n, r) {
			t && (EI(t) ? t.content : t).insertBefore(n, r)
		}
		removeChild(t, n) {
			n.remove()
		}
		selectRootElement(t, n) {
			let r = typeof t == 'string' ? this.doc.querySelector(t) : t
			if (!r) throw new w(-5104, !1)
			return n || (r.textContent = ''), r
		}
		parentNode(t) {
			return t.parentNode
		}
		nextSibling(t) {
			return t.nextSibling
		}
		setAttribute(t, n, r, i) {
			if (i) {
				n = i + ':' + n
				let o = hh[i]
				o ? t.setAttributeNS(o, n, r) : t.setAttribute(n, r)
			} else t.setAttribute(n, r)
		}
		removeAttribute(t, n, r) {
			if (r) {
				let i = hh[r]
				i ? t.removeAttributeNS(i, n) : t.removeAttribute(`${r}:${n}`)
			} else t.removeAttribute(n)
		}
		addClass(t, n) {
			t.classList.add(n)
		}
		removeClass(t, n) {
			t.classList.remove(n)
		}
		setStyle(t, n, r, i) {
			i & (Kt.DashCase | Kt.Important)
				? t.style.setProperty(n, r, i & Kt.Important ? 'important' : '')
				: (t.style[n] = r)
		}
		removeStyle(t, n, r) {
			r & Kt.DashCase ? t.style.removeProperty(n) : (t.style[n] = '')
		}
		setProperty(t, n, r) {
			t != null && (t[n] = r)
		}
		setValue(t, n) {
			t.nodeValue = n
		}
		listen(t, n, r, i) {
			if (
				typeof t == 'string' &&
				((t = At().getGlobalEventTarget(this.doc, t)), !t)
			)
				throw new w(5102, !1)
			let o = this.decoratePreventDefault(r)
			return (
				this.tracingService?.wrapEventListener &&
					(o = this.tracingService.wrapEventListener(t, n, o)),
				this.eventManager.addEventListener(t, n, o, i)
			)
		}
		decoratePreventDefault(t) {
			return (n) => {
				if (n === '__ngUnwrap__') return t
				;(this.platformIsServer ? this.ngZone.runGuarded(() => t(n)) : t(n)) ===
					!1 && n.preventDefault()
			}
		}
	}
function EI(e) {
	return e.tagName === 'TEMPLATE' && e.content !== void 0
}
var Eh = class extends Co {
		sharedStylesHost
		hostEl
		shadowRoot
		constructor(t, n, r, i, o, s, a, c, u) {
			super(t, o, s, c, u),
				(this.sharedStylesHost = n),
				(this.hostEl = r),
				(this.shadowRoot = r.attachShadow({ mode: 'open' })),
				this.sharedStylesHost.addHost(this.shadowRoot)
			let l = i.styles
			l = bI(i.id, l)
			for (let h of l) {
				let f = document.createElement('style')
				a && f.setAttribute('nonce', a),
					(f.textContent = h),
					this.shadowRoot.appendChild(f)
			}
			let d = i.getExternalStyles?.()
			if (d)
				for (let h of d) {
					let f = yh(h, o)
					a && f.setAttribute('nonce', a), this.shadowRoot.appendChild(f)
				}
		}
		nodeOrShadowRoot(t) {
			return t === this.hostEl ? this.shadowRoot : t
		}
		appendChild(t, n) {
			return super.appendChild(this.nodeOrShadowRoot(t), n)
		}
		insertBefore(t, n, r) {
			return super.insertBefore(this.nodeOrShadowRoot(t), n, r)
		}
		removeChild(t, n) {
			return super.removeChild(null, n)
		}
		parentNode(t) {
			return this.nodeOrShadowRoot(super.parentNode(this.nodeOrShadowRoot(t)))
		}
		destroy() {
			this.sharedStylesHost.removeHost(this.shadowRoot)
		}
	},
	To = class extends Co {
		sharedStylesHost
		removeStylesOnCompDestroy
		styles
		styleUrls
		constructor(t, n, r, i, o, s, a, c, u) {
			super(t, o, s, a, c),
				(this.sharedStylesHost = n),
				(this.removeStylesOnCompDestroy = i)
			let l = r.styles
			;(this.styles = u ? bI(u, l) : l),
				(this.styleUrls = r.getExternalStyles?.(u))
		}
		applyStyles() {
			this.sharedStylesHost.addStyles(this.styles, this.styleUrls)
		}
		destroy() {
			this.removeStylesOnCompDestroy &&
				this.sharedStylesHost.removeStyles(this.styles, this.styleUrls)
		}
	},
	Nc = class extends To {
		contentAttr
		hostAttr
		constructor(t, n, r, i, o, s, a, c, u) {
			let l = i + '-' + r.id
			super(t, n, r, o, s, a, c, u, l),
				(this.contentAttr = kO(l)),
				(this.hostAttr = xO(l))
		}
		applyToHost(t) {
			this.applyStyles(), this.setAttribute(t, this.hostAttr, '')
		}
		createElement(t, n) {
			let r = super.createElement(t, n)
			return super.setAttribute(r, this.contentAttr, ''), r
		}
	},
	PO = (() => {
		class e extends Rc {
			constructor(n) {
				super(n)
			}
			supports(n) {
				return !0
			}
			addEventListener(n, r, i, o) {
				return (
					n.addEventListener(r, i, o),
					() => this.removeEventListener(n, r, i, o)
				)
			}
			removeEventListener(n, r, i, o) {
				return n.removeEventListener(r, i, o)
			}
			static ɵfac = function (r) {
				return new (r || e)(I(_e))
			}
			static ɵprov = _({ token: e, factory: e.ɵfac })
		}
		return e
	})(),
	_I = ['alt', 'control', 'meta', 'shift'],
	FO = {
		'\b': 'Backspace',
		'	': 'Tab',
		'\x7F': 'Delete',
		'\x1B': 'Escape',
		Del: 'Delete',
		Esc: 'Escape',
		Left: 'ArrowLeft',
		Right: 'ArrowRight',
		Up: 'ArrowUp',
		Down: 'ArrowDown',
		Menu: 'ContextMenu',
		Scroll: 'ScrollLock',
		Win: 'OS',
	},
	LO = {
		alt: (e) => e.altKey,
		control: (e) => e.ctrlKey,
		meta: (e) => e.metaKey,
		shift: (e) => e.shiftKey,
	},
	VO = (() => {
		class e extends Rc {
			constructor(n) {
				super(n)
			}
			supports(n) {
				return e.parseEventName(n) != null
			}
			addEventListener(n, r, i, o) {
				let s = e.parseEventName(r),
					a = e.eventCallback(s.fullKey, i, this.manager.getZone())
				return this.manager
					.getZone()
					.runOutsideAngular(() => At().onAndCancel(n, s.domEventName, a, o))
			}
			static parseEventName(n) {
				let r = n.toLowerCase().split('.'),
					i = r.shift()
				if (r.length === 0 || !(i === 'keydown' || i === 'keyup')) return null
				let o = e._normalizeKey(r.pop()),
					s = '',
					a = r.indexOf('code')
				if (
					(a > -1 && (r.splice(a, 1), (s = 'code.')),
					_I.forEach((u) => {
						let l = r.indexOf(u)
						l > -1 && (r.splice(l, 1), (s += u + '.'))
					}),
					(s += o),
					r.length != 0 || o.length === 0)
				)
					return null
				let c = {}
				return (c.domEventName = i), (c.fullKey = s), c
			}
			static matchEventFullKeyCode(n, r) {
				let i = FO[n.key] || n.key,
					o = ''
				return (
					r.indexOf('code.') > -1 && ((i = n.code), (o = 'code.')),
					i == null || !i
						? !1
						: ((i = i.toLowerCase()),
						  i === ' ' ? (i = 'space') : i === '.' && (i = 'dot'),
						  _I.forEach((s) => {
								if (s !== i) {
									let a = LO[s]
									a(n) && (o += s + '.')
								}
						  }),
						  (o += i),
						  o === r)
				)
			}
			static eventCallback(n, r, i) {
				return (o) => {
					e.matchEventFullKeyCode(o, n) && i.runGuarded(() => r(o))
				}
			}
			static _normalizeKey(n) {
				return n === 'esc' ? 'escape' : n
			}
			static ɵfac = function (r) {
				return new (r || e)(I(_e))
			}
			static ɵprov = _({ token: e, factory: e.ɵfac })
		}
		return e
	})()
function CI(e, t) {
	return A_(y({ rootComponent: e }, jO(t)))
}
function jO(e) {
	return {
		appProviders: [...TI, ...(e?.providers ?? [])],
		platformProviders: HO,
	}
}
function UO() {
	gh.makeCurrent()
}
function BO() {
	return new qt()
}
function $O() {
	return Qy(document), document
}
var HO = [
	{ provide: ye, useValue: eh },
	{ provide: af, useValue: UO, multi: !0 },
	{ provide: _e, useFactory: $O, deps: [] },
]
var zO = [
		{ provide: ho, useClass: mh, deps: [] },
		{ provide: xf, useClass: gc, deps: [j, mc, ho] },
		{ provide: gc, useClass: gc, deps: [j, mc, ho] },
	],
	TI = [
		{ provide: Ua, useValue: 'root' },
		{ provide: qt, useFactory: BO, deps: [] },
		{ provide: vh, useClass: PO, multi: !0, deps: [_e] },
		{ provide: vh, useClass: VO, multi: !0, deps: [_e] },
		yI,
		wI,
		II,
		{ provide: _n, useExisting: yI },
		{ provide: hi, useClass: SO, deps: [] },
		[],
	],
	SI = (() => {
		class e {
			constructor() {}
			static ɵfac = function (r) {
				return new (r || e)()
			}
			static ɵmod = ct({ type: e })
			static ɵinj = ot({ providers: [...TI, ...zO], imports: [Mt, S_] })
		}
		return e
	})()
var AI = (() => {
	class e {
		_doc
		constructor(n) {
			this._doc = n
		}
		getTitle() {
			return this._doc.title
		}
		setTitle(n) {
			this._doc.title = n || ''
		}
		static ɵfac = function (r) {
			return new (r || e)(I(_e))
		}
		static ɵprov = _({ token: e, factory: e.ɵfac, providedIn: 'root' })
	}
	return e
})()
var Oc = (function (e) {
	return (
		(e[(e.NoHttpTransferCache = 0)] = 'NoHttpTransferCache'),
		(e[(e.HttpTransferCacheOptions = 1)] = 'HttpTransferCacheOptions'),
		(e[(e.I18nSupport = 2)] = 'I18nSupport'),
		(e[(e.EventReplay = 3)] = 'EventReplay'),
		(e[(e.IncrementalHydration = 4)] = 'IncrementalHydration'),
		e
	)
})(Oc || {})
function WO(e, t = [], n = {}) {
	return { ɵkind: e, ɵproviders: t }
}
function MI() {
	return WO(Oc.EventReplay, M_())
}
function RI(...e) {
	let t = [],
		n = new Set(),
		r = n.has(Oc.HttpTransferCacheOptions)
	for (let { ɵproviders: i, ɵkind: o } of e) n.add(o), i.length && t.push(i)
	return qe([[], R_(), n.has(Oc.NoHttpTransferCache) || r ? [] : pI({}), t])
}
var x = 'primary',
	Uo = Symbol('RouteTitle'),
	Ch = class {
		params
		constructor(t) {
			this.params = t || {}
		}
		has(t) {
			return Object.prototype.hasOwnProperty.call(this.params, t)
		}
		get(t) {
			if (this.has(t)) {
				let n = this.params[t]
				return Array.isArray(n) ? n[0] : n
			}
			return null
		}
		getAll(t) {
			if (this.has(t)) {
				let n = this.params[t]
				return Array.isArray(n) ? n : [n]
			}
			return []
		}
		get keys() {
			return Object.keys(this.params)
		}
	}
function Ii(e) {
	return new Ch(e)
}
function qO(e, t, n) {
	let r = n.path.split('/')
	if (
		r.length > e.length ||
		(n.pathMatch === 'full' && (t.hasChildren() || r.length < e.length))
	)
		return null
	let i = {}
	for (let o = 0; o < r.length; o++) {
		let s = r[o],
			a = e[o]
		if (s[0] === ':') i[s.substring(1)] = a
		else if (s !== a.path) return null
	}
	return { consumed: e.slice(0, r.length), posParams: i }
}
function KO(e, t) {
	if (e.length !== t.length) return !1
	for (let n = 0; n < e.length; ++n) if (!Nt(e[n], t[n])) return !1
	return !0
}
function Nt(e, t) {
	let n = e ? Th(e) : void 0,
		r = t ? Th(t) : void 0
	if (!n || !r || n.length != r.length) return !1
	let i
	for (let o = 0; o < n.length; o++)
		if (((i = n[o]), !UI(e[i], t[i]))) return !1
	return !0
}
function Th(e) {
	return [...Object.keys(e), ...Object.getOwnPropertySymbols(e)]
}
function UI(e, t) {
	if (Array.isArray(e) && Array.isArray(t)) {
		if (e.length !== t.length) return !1
		let n = [...e].sort(),
			r = [...t].sort()
		return n.every((i, o) => r[o] === i)
	} else return e === t
}
function BI(e) {
	return e.length > 0 ? e[e.length - 1] : null
}
function xn(e) {
	return hl(e) ? e : Cn(e) ? Z(Promise.resolve(e)) : C(e)
}
var YO = { exact: HI, subset: zI },
	$I = { exact: ZO, subset: QO, ignored: () => !0 }
function NI(e, t, n) {
	return (
		YO[n.paths](e.root, t.root, n.matrixParams) &&
		$I[n.queryParams](e.queryParams, t.queryParams) &&
		!(n.fragment === 'exact' && e.fragment !== t.fragment)
	)
}
function ZO(e, t) {
	return Nt(e, t)
}
function HI(e, t, n) {
	if (
		!dr(e.segments, t.segments) ||
		!Pc(e.segments, t.segments, n) ||
		e.numberOfChildren !== t.numberOfChildren
	)
		return !1
	for (let r in t.children)
		if (!e.children[r] || !HI(e.children[r], t.children[r], n)) return !1
	return !0
}
function QO(e, t) {
	return (
		Object.keys(t).length <= Object.keys(e).length &&
		Object.keys(t).every((n) => UI(e[n], t[n]))
	)
}
function zI(e, t, n) {
	return WI(e, t, t.segments, n)
}
function WI(e, t, n, r) {
	if (e.segments.length > n.length) {
		let i = e.segments.slice(0, n.length)
		return !(!dr(i, n) || t.hasChildren() || !Pc(i, n, r))
	} else if (e.segments.length === n.length) {
		if (!dr(e.segments, n) || !Pc(e.segments, n, r)) return !1
		for (let i in t.children)
			if (!e.children[i] || !zI(e.children[i], t.children[i], r)) return !1
		return !0
	} else {
		let i = n.slice(0, e.segments.length),
			o = n.slice(e.segments.length)
		return !dr(e.segments, i) || !Pc(e.segments, i, r) || !e.children[x]
			? !1
			: WI(e.children[x], t, o, r)
	}
}
function Pc(e, t, n) {
	return t.every((r, i) => $I[n](e[i].parameters, r.parameters))
}
var tn = class {
		root
		queryParams
		fragment
		_queryParamMap
		constructor(t = new q([], {}), n = {}, r = null) {
			;(this.root = t), (this.queryParams = n), (this.fragment = r)
		}
		get queryParamMap() {
			return (this._queryParamMap ??= Ii(this.queryParams)), this._queryParamMap
		}
		toString() {
			return ek.serialize(this)
		}
	},
	q = class {
		segments
		children
		parent = null
		constructor(t, n) {
			;(this.segments = t),
				(this.children = n),
				Object.values(n).forEach((r) => (r.parent = this))
		}
		hasChildren() {
			return this.numberOfChildren > 0
		}
		get numberOfChildren() {
			return Object.keys(this.children).length
		}
		toString() {
			return Fc(this)
		}
	},
	lr = class {
		path
		parameters
		_parameterMap
		constructor(t, n) {
			;(this.path = t), (this.parameters = n)
		}
		get parameterMap() {
			return (this._parameterMap ??= Ii(this.parameters)), this._parameterMap
		}
		toString() {
			return qI(this)
		}
	}
function JO(e, t) {
	return dr(e, t) && e.every((n, r) => Nt(n.parameters, t[r].parameters))
}
function dr(e, t) {
	return e.length !== t.length ? !1 : e.every((n, r) => n.path === t[r].path)
}
function XO(e, t) {
	let n = []
	return (
		Object.entries(e.children).forEach(([r, i]) => {
			r === x && (n = n.concat(t(i, r)))
		}),
		Object.entries(e.children).forEach(([r, i]) => {
			r !== x && (n = n.concat(t(i, r)))
		}),
		n
	)
}
var Bo = (() => {
		class e {
			static ɵfac = function (r) {
				return new (r || e)()
			}
			static ɵprov = _({
				token: e,
				factory: () => new wi(),
				providedIn: 'root',
			})
		}
		return e
	})(),
	wi = class {
		parse(t) {
			let n = new Ah(t)
			return new tn(
				n.parseRootSegment(),
				n.parseQueryParams(),
				n.parseFragment()
			)
		}
		serialize(t) {
			let n = `/${So(t.root, !0)}`,
				r = rk(t.queryParams),
				i = typeof t.fragment == 'string' ? `#${tk(t.fragment)}` : ''
			return `${n}${r}${i}`
		}
	},
	ek = new wi()
function Fc(e) {
	return e.segments.map((t) => qI(t)).join('/')
}
function So(e, t) {
	if (!e.hasChildren()) return Fc(e)
	if (t) {
		let n = e.children[x] ? So(e.children[x], !1) : '',
			r = []
		return (
			Object.entries(e.children).forEach(([i, o]) => {
				i !== x && r.push(`${i}:${So(o, !1)}`)
			}),
			r.length > 0 ? `${n}(${r.join('//')})` : n
		)
	} else {
		let n = XO(e, (r, i) =>
			i === x ? [So(e.children[x], !1)] : [`${i}:${So(r, !1)}`]
		)
		return Object.keys(e.children).length === 1 && e.children[x] != null
			? `${Fc(e)}/${n[0]}`
			: `${Fc(e)}/(${n.join('//')})`
	}
}
function GI(e) {
	return encodeURIComponent(e)
		.replace(/%40/g, '@')
		.replace(/%3A/gi, ':')
		.replace(/%24/g, '$')
		.replace(/%2C/gi, ',')
}
function kc(e) {
	return GI(e).replace(/%3B/gi, ';')
}
function tk(e) {
	return encodeURI(e)
}
function Sh(e) {
	return GI(e).replace(/\(/g, '%28').replace(/\)/g, '%29').replace(/%26/gi, '&')
}
function Lc(e) {
	return decodeURIComponent(e)
}
function OI(e) {
	return Lc(e.replace(/\+/g, '%20'))
}
function qI(e) {
	return `${Sh(e.path)}${nk(e.parameters)}`
}
function nk(e) {
	return Object.entries(e)
		.map(([t, n]) => `;${Sh(t)}=${Sh(n)}`)
		.join('')
}
function rk(e) {
	let t = Object.entries(e)
		.map(([n, r]) =>
			Array.isArray(r)
				? r.map((i) => `${kc(n)}=${kc(i)}`).join('&')
				: `${kc(n)}=${kc(r)}`
		)
		.filter((n) => n)
	return t.length ? `?${t.join('&')}` : ''
}
var ik = /^[^\/()?;#]+/
function Ih(e) {
	let t = e.match(ik)
	return t ? t[0] : ''
}
var ok = /^[^\/()?;=#]+/
function sk(e) {
	let t = e.match(ok)
	return t ? t[0] : ''
}
var ak = /^[^=?&#]+/
function ck(e) {
	let t = e.match(ak)
	return t ? t[0] : ''
}
var uk = /^[^&#]+/
function lk(e) {
	let t = e.match(uk)
	return t ? t[0] : ''
}
var Ah = class {
	url
	remaining
	constructor(t) {
		;(this.url = t), (this.remaining = t)
	}
	parseRootSegment() {
		return (
			this.consumeOptional('/'),
			this.remaining === '' ||
			this.peekStartsWith('?') ||
			this.peekStartsWith('#')
				? new q([], {})
				: new q([], this.parseChildren())
		)
	}
	parseQueryParams() {
		let t = {}
		if (this.consumeOptional('?'))
			do this.parseQueryParam(t)
			while (this.consumeOptional('&'))
		return t
	}
	parseFragment() {
		return this.consumeOptional('#') ? decodeURIComponent(this.remaining) : null
	}
	parseChildren() {
		if (this.remaining === '') return {}
		this.consumeOptional('/')
		let t = []
		for (
			this.peekStartsWith('(') || t.push(this.parseSegment());
			this.peekStartsWith('/') &&
			!this.peekStartsWith('//') &&
			!this.peekStartsWith('/(');

		)
			this.capture('/'), t.push(this.parseSegment())
		let n = {}
		this.peekStartsWith('/(') && (this.capture('/'), (n = this.parseParens(!0)))
		let r = {}
		return (
			this.peekStartsWith('(') && (r = this.parseParens(!1)),
			(t.length > 0 || Object.keys(n).length > 0) && (r[x] = new q(t, n)),
			r
		)
	}
	parseSegment() {
		let t = Ih(this.remaining)
		if (t === '' && this.peekStartsWith(';')) throw new w(4009, !1)
		return this.capture(t), new lr(Lc(t), this.parseMatrixParams())
	}
	parseMatrixParams() {
		let t = {}
		for (; this.consumeOptional(';'); ) this.parseParam(t)
		return t
	}
	parseParam(t) {
		let n = sk(this.remaining)
		if (!n) return
		this.capture(n)
		let r = ''
		if (this.consumeOptional('=')) {
			let i = Ih(this.remaining)
			i && ((r = i), this.capture(r))
		}
		t[Lc(n)] = Lc(r)
	}
	parseQueryParam(t) {
		let n = ck(this.remaining)
		if (!n) return
		this.capture(n)
		let r = ''
		if (this.consumeOptional('=')) {
			let s = lk(this.remaining)
			s && ((r = s), this.capture(r))
		}
		let i = OI(n),
			o = OI(r)
		if (t.hasOwnProperty(i)) {
			let s = t[i]
			Array.isArray(s) || ((s = [s]), (t[i] = s)), s.push(o)
		} else t[i] = o
	}
	parseParens(t) {
		let n = {}
		for (
			this.capture('(');
			!this.consumeOptional(')') && this.remaining.length > 0;

		) {
			let r = Ih(this.remaining),
				i = this.remaining[r.length]
			if (i !== '/' && i !== ')' && i !== ';') throw new w(4010, !1)
			let o
			r.indexOf(':') > -1
				? ((o = r.slice(0, r.indexOf(':'))), this.capture(o), this.capture(':'))
				: t && (o = x)
			let s = this.parseChildren()
			;(n[o] = Object.keys(s).length === 1 ? s[x] : new q([], s)),
				this.consumeOptional('//')
		}
		return n
	}
	peekStartsWith(t) {
		return this.remaining.startsWith(t)
	}
	consumeOptional(t) {
		return this.peekStartsWith(t)
			? ((this.remaining = this.remaining.substring(t.length)), !0)
			: !1
	}
	capture(t) {
		if (!this.consumeOptional(t)) throw new w(4011, !1)
	}
}
function KI(e) {
	return e.segments.length > 0 ? new q([], { [x]: e }) : e
}
function YI(e) {
	let t = {}
	for (let [r, i] of Object.entries(e.children)) {
		let o = YI(i)
		if (r === x && o.segments.length === 0 && o.hasChildren())
			for (let [s, a] of Object.entries(o.children)) t[s] = a
		else (o.segments.length > 0 || o.hasChildren()) && (t[r] = o)
	}
	let n = new q(e.segments, t)
	return dk(n)
}
function dk(e) {
	if (e.numberOfChildren === 1 && e.children[x]) {
		let t = e.children[x]
		return new q(e.segments.concat(t.segments), t.children)
	}
	return e
}
function fr(e) {
	return e instanceof tn
}
function fk(e, t, n = null, r = null) {
	let i = ZI(e)
	return QI(i, t, n, r)
}
function ZI(e) {
	let t
	function n(o) {
		let s = {}
		for (let c of o.children) {
			let u = n(c)
			s[c.outlet] = u
		}
		let a = new q(o.url, s)
		return o === e && (t = a), a
	}
	let r = n(e.root),
		i = KI(r)
	return t ?? i
}
function QI(e, t, n, r) {
	let i = e
	for (; i.parent; ) i = i.parent
	if (t.length === 0) return wh(i, i, i, n, r)
	let o = hk(t)
	if (o.toRoot()) return wh(i, i, new q([], {}), n, r)
	let s = pk(o, i, e),
		a = s.processChildren
			? Mo(s.segmentGroup, s.index, o.commands)
			: XI(s.segmentGroup, s.index, o.commands)
	return wh(i, s.segmentGroup, a, n, r)
}
function Vc(e) {
	return typeof e == 'object' && e != null && !e.outlets && !e.segmentPath
}
function Oo(e) {
	return typeof e == 'object' && e != null && e.outlets
}
function wh(e, t, n, r, i) {
	let o = {}
	r &&
		Object.entries(r).forEach(([c, u]) => {
			o[c] = Array.isArray(u) ? u.map((l) => `${l}`) : `${u}`
		})
	let s
	e === t ? (s = n) : (s = JI(e, t, n))
	let a = KI(YI(s))
	return new tn(a, o, i)
}
function JI(e, t, n) {
	let r = {}
	return (
		Object.entries(e.children).forEach(([i, o]) => {
			o === t ? (r[i] = n) : (r[i] = JI(o, t, n))
		}),
		new q(e.segments, r)
	)
}
var jc = class {
	isAbsolute
	numberOfDoubleDots
	commands
	constructor(t, n, r) {
		if (
			((this.isAbsolute = t),
			(this.numberOfDoubleDots = n),
			(this.commands = r),
			t && r.length > 0 && Vc(r[0]))
		)
			throw new w(4003, !1)
		let i = r.find(Oo)
		if (i && i !== BI(r)) throw new w(4004, !1)
	}
	toRoot() {
		return (
			this.isAbsolute && this.commands.length === 1 && this.commands[0] == '/'
		)
	}
}
function hk(e) {
	if (typeof e[0] == 'string' && e.length === 1 && e[0] === '/')
		return new jc(!0, 0, e)
	let t = 0,
		n = !1,
		r = e.reduce((i, o, s) => {
			if (typeof o == 'object' && o != null) {
				if (o.outlets) {
					let a = {}
					return (
						Object.entries(o.outlets).forEach(([c, u]) => {
							a[c] = typeof u == 'string' ? u.split('/') : u
						}),
						[...i, { outlets: a }]
					)
				}
				if (o.segmentPath) return [...i, o.segmentPath]
			}
			return typeof o != 'string'
				? [...i, o]
				: s === 0
				? (o.split('/').forEach((a, c) => {
						;(c == 0 && a === '.') ||
							(c == 0 && a === ''
								? (n = !0)
								: a === '..'
								? t++
								: a != '' && i.push(a))
				  }),
				  i)
				: [...i, o]
		}, [])
	return new jc(n, t, r)
}
var yi = class {
	segmentGroup
	processChildren
	index
	constructor(t, n, r) {
		;(this.segmentGroup = t), (this.processChildren = n), (this.index = r)
	}
}
function pk(e, t, n) {
	if (e.isAbsolute) return new yi(t, !0, 0)
	if (!n) return new yi(t, !1, NaN)
	if (n.parent === null) return new yi(n, !0, 0)
	let r = Vc(e.commands[0]) ? 0 : 1,
		i = n.segments.length - 1 + r
	return gk(n, i, e.numberOfDoubleDots)
}
function gk(e, t, n) {
	let r = e,
		i = t,
		o = n
	for (; o > i; ) {
		if (((o -= i), (r = r.parent), !r)) throw new w(4005, !1)
		i = r.segments.length
	}
	return new yi(r, !1, i - o)
}
function mk(e) {
	return Oo(e[0]) ? e[0].outlets : { [x]: e }
}
function XI(e, t, n) {
	if (((e ??= new q([], {})), e.segments.length === 0 && e.hasChildren()))
		return Mo(e, t, n)
	let r = vk(e, t, n),
		i = n.slice(r.commandIndex)
	if (r.match && r.pathIndex < e.segments.length) {
		let o = new q(e.segments.slice(0, r.pathIndex), {})
		return (
			(o.children[x] = new q(e.segments.slice(r.pathIndex), e.children)),
			Mo(o, 0, i)
		)
	} else
		return r.match && i.length === 0
			? new q(e.segments, {})
			: r.match && !e.hasChildren()
			? Mh(e, t, n)
			: r.match
			? Mo(e, 0, i)
			: Mh(e, t, n)
}
function Mo(e, t, n) {
	if (n.length === 0) return new q(e.segments, {})
	{
		let r = mk(n),
			i = {}
		if (
			Object.keys(r).some((o) => o !== x) &&
			e.children[x] &&
			e.numberOfChildren === 1 &&
			e.children[x].segments.length === 0
		) {
			let o = Mo(e.children[x], t, n)
			return new q(e.segments, o.children)
		}
		return (
			Object.entries(r).forEach(([o, s]) => {
				typeof s == 'string' && (s = [s]),
					s !== null && (i[o] = XI(e.children[o], t, s))
			}),
			Object.entries(e.children).forEach(([o, s]) => {
				r[o] === void 0 && (i[o] = s)
			}),
			new q(e.segments, i)
		)
	}
}
function vk(e, t, n) {
	let r = 0,
		i = t,
		o = { match: !1, pathIndex: 0, commandIndex: 0 }
	for (; i < e.segments.length; ) {
		if (r >= n.length) return o
		let s = e.segments[i],
			a = n[r]
		if (Oo(a)) break
		let c = `${a}`,
			u = r < n.length - 1 ? n[r + 1] : null
		if (i > 0 && c === void 0) break
		if (c && u && typeof u == 'object' && u.outlets === void 0) {
			if (!xI(c, u, s)) return o
			r += 2
		} else {
			if (!xI(c, {}, s)) return o
			r++
		}
		i++
	}
	return { match: !0, pathIndex: i, commandIndex: r }
}
function Mh(e, t, n) {
	let r = e.segments.slice(0, t),
		i = 0
	for (; i < n.length; ) {
		let o = n[i]
		if (Oo(o)) {
			let c = yk(o.outlets)
			return new q(r, c)
		}
		if (i === 0 && Vc(n[0])) {
			let c = e.segments[t]
			r.push(new lr(c.path, kI(n[0]))), i++
			continue
		}
		let s = Oo(o) ? o.outlets[x] : `${o}`,
			a = i < n.length - 1 ? n[i + 1] : null
		s && a && Vc(a)
			? (r.push(new lr(s, kI(a))), (i += 2))
			: (r.push(new lr(s, {})), i++)
	}
	return new q(r, {})
}
function yk(e) {
	let t = {}
	return (
		Object.entries(e).forEach(([n, r]) => {
			typeof r == 'string' && (r = [r]),
				r !== null && (t[n] = Mh(new q([], {}), 0, r))
		}),
		t
	)
}
function kI(e) {
	let t = {}
	return Object.entries(e).forEach(([n, r]) => (t[n] = `${r}`)), t
}
function xI(e, t, n) {
	return e == n.path && Nt(t, n.parameters)
}
var Ro = 'imperative',
	ge = (function (e) {
		return (
			(e[(e.NavigationStart = 0)] = 'NavigationStart'),
			(e[(e.NavigationEnd = 1)] = 'NavigationEnd'),
			(e[(e.NavigationCancel = 2)] = 'NavigationCancel'),
			(e[(e.NavigationError = 3)] = 'NavigationError'),
			(e[(e.RoutesRecognized = 4)] = 'RoutesRecognized'),
			(e[(e.ResolveStart = 5)] = 'ResolveStart'),
			(e[(e.ResolveEnd = 6)] = 'ResolveEnd'),
			(e[(e.GuardsCheckStart = 7)] = 'GuardsCheckStart'),
			(e[(e.GuardsCheckEnd = 8)] = 'GuardsCheckEnd'),
			(e[(e.RouteConfigLoadStart = 9)] = 'RouteConfigLoadStart'),
			(e[(e.RouteConfigLoadEnd = 10)] = 'RouteConfigLoadEnd'),
			(e[(e.ChildActivationStart = 11)] = 'ChildActivationStart'),
			(e[(e.ChildActivationEnd = 12)] = 'ChildActivationEnd'),
			(e[(e.ActivationStart = 13)] = 'ActivationStart'),
			(e[(e.ActivationEnd = 14)] = 'ActivationEnd'),
			(e[(e.Scroll = 15)] = 'Scroll'),
			(e[(e.NavigationSkipped = 16)] = 'NavigationSkipped'),
			e
		)
	})(ge || {}),
	Qe = class {
		id
		url
		constructor(t, n) {
			;(this.id = t), (this.url = n)
		}
	},
	Di = class extends Qe {
		type = ge.NavigationStart
		navigationTrigger
		restoredState
		constructor(t, n, r = 'imperative', i = null) {
			super(t, n), (this.navigationTrigger = r), (this.restoredState = i)
		}
		toString() {
			return `NavigationStart(id: ${this.id}, url: '${this.url}')`
		}
	},
	Ot = class extends Qe {
		urlAfterRedirects
		type = ge.NavigationEnd
		constructor(t, n, r) {
			super(t, n), (this.urlAfterRedirects = r)
		}
		toString() {
			return `NavigationEnd(id: ${this.id}, url: '${this.url}', urlAfterRedirects: '${this.urlAfterRedirects}')`
		}
	},
	$e = (function (e) {
		return (
			(e[(e.Redirect = 0)] = 'Redirect'),
			(e[(e.SupersededByNewNavigation = 1)] = 'SupersededByNewNavigation'),
			(e[(e.NoDataFromResolver = 2)] = 'NoDataFromResolver'),
			(e[(e.GuardRejected = 3)] = 'GuardRejected'),
			e
		)
	})($e || {}),
	Uc = (function (e) {
		return (
			(e[(e.IgnoredSameUrlNavigation = 0)] = 'IgnoredSameUrlNavigation'),
			(e[(e.IgnoredByUrlHandlingStrategy = 1)] =
				'IgnoredByUrlHandlingStrategy'),
			e
		)
	})(Uc || {}),
	en = class extends Qe {
		reason
		code
		type = ge.NavigationCancel
		constructor(t, n, r, i) {
			super(t, n), (this.reason = r), (this.code = i)
		}
		toString() {
			return `NavigationCancel(id: ${this.id}, url: '${this.url}')`
		}
	},
	kn = class extends Qe {
		reason
		code
		type = ge.NavigationSkipped
		constructor(t, n, r, i) {
			super(t, n), (this.reason = r), (this.code = i)
		}
	},
	ko = class extends Qe {
		error
		target
		type = ge.NavigationError
		constructor(t, n, r, i) {
			super(t, n), (this.error = r), (this.target = i)
		}
		toString() {
			return `NavigationError(id: ${this.id}, url: '${this.url}', error: ${this.error})`
		}
	},
	Bc = class extends Qe {
		urlAfterRedirects
		state
		type = ge.RoutesRecognized
		constructor(t, n, r, i) {
			super(t, n), (this.urlAfterRedirects = r), (this.state = i)
		}
		toString() {
			return `RoutesRecognized(id: ${this.id}, url: '${this.url}', urlAfterRedirects: '${this.urlAfterRedirects}', state: ${this.state})`
		}
	},
	Rh = class extends Qe {
		urlAfterRedirects
		state
		type = ge.GuardsCheckStart
		constructor(t, n, r, i) {
			super(t, n), (this.urlAfterRedirects = r), (this.state = i)
		}
		toString() {
			return `GuardsCheckStart(id: ${this.id}, url: '${this.url}', urlAfterRedirects: '${this.urlAfterRedirects}', state: ${this.state})`
		}
	},
	Nh = class extends Qe {
		urlAfterRedirects
		state
		shouldActivate
		type = ge.GuardsCheckEnd
		constructor(t, n, r, i, o) {
			super(t, n),
				(this.urlAfterRedirects = r),
				(this.state = i),
				(this.shouldActivate = o)
		}
		toString() {
			return `GuardsCheckEnd(id: ${this.id}, url: '${this.url}', urlAfterRedirects: '${this.urlAfterRedirects}', state: ${this.state}, shouldActivate: ${this.shouldActivate})`
		}
	},
	Oh = class extends Qe {
		urlAfterRedirects
		state
		type = ge.ResolveStart
		constructor(t, n, r, i) {
			super(t, n), (this.urlAfterRedirects = r), (this.state = i)
		}
		toString() {
			return `ResolveStart(id: ${this.id}, url: '${this.url}', urlAfterRedirects: '${this.urlAfterRedirects}', state: ${this.state})`
		}
	},
	kh = class extends Qe {
		urlAfterRedirects
		state
		type = ge.ResolveEnd
		constructor(t, n, r, i) {
			super(t, n), (this.urlAfterRedirects = r), (this.state = i)
		}
		toString() {
			return `ResolveEnd(id: ${this.id}, url: '${this.url}', urlAfterRedirects: '${this.urlAfterRedirects}', state: ${this.state})`
		}
	},
	xh = class {
		route
		type = ge.RouteConfigLoadStart
		constructor(t) {
			this.route = t
		}
		toString() {
			return `RouteConfigLoadStart(path: ${this.route.path})`
		}
	},
	Ph = class {
		route
		type = ge.RouteConfigLoadEnd
		constructor(t) {
			this.route = t
		}
		toString() {
			return `RouteConfigLoadEnd(path: ${this.route.path})`
		}
	},
	Fh = class {
		snapshot
		type = ge.ChildActivationStart
		constructor(t) {
			this.snapshot = t
		}
		toString() {
			return `ChildActivationStart(path: '${
				(this.snapshot.routeConfig && this.snapshot.routeConfig.path) || ''
			}')`
		}
	},
	Lh = class {
		snapshot
		type = ge.ChildActivationEnd
		constructor(t) {
			this.snapshot = t
		}
		toString() {
			return `ChildActivationEnd(path: '${
				(this.snapshot.routeConfig && this.snapshot.routeConfig.path) || ''
			}')`
		}
	},
	Vh = class {
		snapshot
		type = ge.ActivationStart
		constructor(t) {
			this.snapshot = t
		}
		toString() {
			return `ActivationStart(path: '${
				(this.snapshot.routeConfig && this.snapshot.routeConfig.path) || ''
			}')`
		}
	},
	jh = class {
		snapshot
		type = ge.ActivationEnd
		constructor(t) {
			this.snapshot = t
		}
		toString() {
			return `ActivationEnd(path: '${
				(this.snapshot.routeConfig && this.snapshot.routeConfig.path) || ''
			}')`
		}
	},
	$c = class {
		routerEvent
		position
		anchor
		type = ge.Scroll
		constructor(t, n, r) {
			;(this.routerEvent = t), (this.position = n), (this.anchor = r)
		}
		toString() {
			let t = this.position ? `${this.position[0]}, ${this.position[1]}` : null
			return `Scroll(anchor: '${this.anchor}', position: '${t}')`
		}
	},
	xo = class {},
	bi = class {
		url
		navigationBehaviorOptions
		constructor(t, n) {
			;(this.url = t), (this.navigationBehaviorOptions = n)
		}
	}
function Ek(e, t) {
	return (
		e.providers &&
			!e._injector &&
			(e._injector = fo(e.providers, t, `Route: ${e.path}`)),
		e._injector ?? t
	)
}
function lt(e) {
	return e.outlet || x
}
function _k(e, t) {
	let n = e.filter((r) => lt(r) === t)
	return n.push(...e.filter((r) => lt(r) !== t)), n
}
function $o(e) {
	if (!e) return null
	if (e.routeConfig?._injector) return e.routeConfig._injector
	for (let t = e.parent; t; t = t.parent) {
		let n = t.routeConfig
		if (n?._loadedInjector) return n._loadedInjector
		if (n?._injector) return n._injector
	}
	return null
}
var Uh = class {
		rootInjector
		outlet = null
		route = null
		children
		attachRef = null
		get injector() {
			return $o(this.route?.snapshot) ?? this.rootInjector
		}
		constructor(t) {
			;(this.rootInjector = t), (this.children = new Ho(this.rootInjector))
		}
	},
	Ho = (() => {
		class e {
			rootInjector
			contexts = new Map()
			constructor(n) {
				this.rootInjector = n
			}
			onChildOutletCreated(n, r) {
				let i = this.getOrCreateContext(n)
				;(i.outlet = r), this.contexts.set(n, i)
			}
			onChildOutletDestroyed(n) {
				let r = this.getContext(n)
				r && ((r.outlet = null), (r.attachRef = null))
			}
			onOutletDeactivated() {
				let n = this.contexts
				return (this.contexts = new Map()), n
			}
			onOutletReAttached(n) {
				this.contexts = n
			}
			getOrCreateContext(n) {
				let r = this.getContext(n)
				return (
					r || ((r = new Uh(this.rootInjector)), this.contexts.set(n, r)), r
				)
			}
			getContext(n) {
				return this.contexts.get(n) || null
			}
			static ɵfac = function (r) {
				return new (r || e)(I(fe))
			}
			static ɵprov = _({ token: e, factory: e.ɵfac, providedIn: 'root' })
		}
		return e
	})(),
	Hc = class {
		_root
		constructor(t) {
			this._root = t
		}
		get root() {
			return this._root.value
		}
		parent(t) {
			let n = this.pathFromRoot(t)
			return n.length > 1 ? n[n.length - 2] : null
		}
		children(t) {
			let n = Bh(t, this._root)
			return n ? n.children.map((r) => r.value) : []
		}
		firstChild(t) {
			let n = Bh(t, this._root)
			return n && n.children.length > 0 ? n.children[0].value : null
		}
		siblings(t) {
			let n = $h(t, this._root)
			return n.length < 2
				? []
				: n[n.length - 2].children.map((i) => i.value).filter((i) => i !== t)
		}
		pathFromRoot(t) {
			return $h(t, this._root).map((n) => n.value)
		}
	}
function Bh(e, t) {
	if (e === t.value) return t
	for (let n of t.children) {
		let r = Bh(e, n)
		if (r) return r
	}
	return null
}
function $h(e, t) {
	if (e === t.value) return [t]
	for (let n of t.children) {
		let r = $h(e, n)
		if (r.length) return r.unshift(t), r
	}
	return []
}
var Be = class {
	value
	children
	constructor(t, n) {
		;(this.value = t), (this.children = n)
	}
	toString() {
		return `TreeNode(${this.value})`
	}
}
function vi(e) {
	let t = {}
	return e && e.children.forEach((n) => (t[n.value.outlet] = n)), t
}
var zc = class extends Hc {
	snapshot
	constructor(t, n) {
		super(t), (this.snapshot = n), Qh(this, t)
	}
	toString() {
		return this.snapshot.toString()
	}
}
function ew(e) {
	let t = Ik(e),
		n = new ee([new lr('', {})]),
		r = new ee({}),
		i = new ee({}),
		o = new ee({}),
		s = new ee(''),
		a = new kt(n, r, o, s, i, x, e, t.root)
	return (a.snapshot = t.root), new zc(new Be(a, []), t)
}
function Ik(e) {
	let t = {},
		n = {},
		r = {},
		i = '',
		o = new Ei([], t, r, i, n, x, e, null, {})
	return new Gc('', new Be(o, []))
}
var kt = class {
	urlSubject
	paramsSubject
	queryParamsSubject
	fragmentSubject
	dataSubject
	outlet
	component
	snapshot
	_futureSnapshot
	_routerState
	_paramMap
	_queryParamMap
	title
	url
	params
	queryParams
	fragment
	data
	constructor(t, n, r, i, o, s, a, c) {
		;(this.urlSubject = t),
			(this.paramsSubject = n),
			(this.queryParamsSubject = r),
			(this.fragmentSubject = i),
			(this.dataSubject = o),
			(this.outlet = s),
			(this.component = a),
			(this._futureSnapshot = c),
			(this.title = this.dataSubject?.pipe(k((u) => u[Uo])) ?? C(void 0)),
			(this.url = t),
			(this.params = n),
			(this.queryParams = r),
			(this.fragment = i),
			(this.data = o)
	}
	get routeConfig() {
		return this._futureSnapshot.routeConfig
	}
	get root() {
		return this._routerState.root
	}
	get parent() {
		return this._routerState.parent(this)
	}
	get firstChild() {
		return this._routerState.firstChild(this)
	}
	get children() {
		return this._routerState.children(this)
	}
	get pathFromRoot() {
		return this._routerState.pathFromRoot(this)
	}
	get paramMap() {
		return (
			(this._paramMap ??= this.params.pipe(k((t) => Ii(t)))), this._paramMap
		)
	}
	get queryParamMap() {
		return (
			(this._queryParamMap ??= this.queryParams.pipe(k((t) => Ii(t)))),
			this._queryParamMap
		)
	}
	toString() {
		return this.snapshot
			? this.snapshot.toString()
			: `Future(${this._futureSnapshot})`
	}
}
function Wc(e, t, n = 'emptyOnly') {
	let r,
		{ routeConfig: i } = e
	return (
		t !== null &&
		(n === 'always' ||
			i?.path === '' ||
			(!t.component && !t.routeConfig?.loadComponent))
			? (r = {
					params: y(y({}, t.params), e.params),
					data: y(y({}, t.data), e.data),
					resolve: y(y(y(y({}, e.data), t.data), i?.data), e._resolvedData),
			  })
			: (r = {
					params: y({}, e.params),
					data: y({}, e.data),
					resolve: y(y({}, e.data), e._resolvedData ?? {}),
			  }),
		i && nw(i) && (r.resolve[Uo] = i.title),
		r
	)
}
var Ei = class {
		url
		params
		queryParams
		fragment
		data
		outlet
		component
		routeConfig
		_resolve
		_resolvedData
		_routerState
		_paramMap
		_queryParamMap
		get title() {
			return this.data?.[Uo]
		}
		constructor(t, n, r, i, o, s, a, c, u) {
			;(this.url = t),
				(this.params = n),
				(this.queryParams = r),
				(this.fragment = i),
				(this.data = o),
				(this.outlet = s),
				(this.component = a),
				(this.routeConfig = c),
				(this._resolve = u)
		}
		get root() {
			return this._routerState.root
		}
		get parent() {
			return this._routerState.parent(this)
		}
		get firstChild() {
			return this._routerState.firstChild(this)
		}
		get children() {
			return this._routerState.children(this)
		}
		get pathFromRoot() {
			return this._routerState.pathFromRoot(this)
		}
		get paramMap() {
			return (this._paramMap ??= Ii(this.params)), this._paramMap
		}
		get queryParamMap() {
			return (this._queryParamMap ??= Ii(this.queryParams)), this._queryParamMap
		}
		toString() {
			let t = this.url.map((r) => r.toString()).join('/'),
				n = this.routeConfig ? this.routeConfig.path : ''
			return `Route(url:'${t}', path:'${n}')`
		}
	},
	Gc = class extends Hc {
		url
		constructor(t, n) {
			super(n), (this.url = t), Qh(this, n)
		}
		toString() {
			return tw(this._root)
		}
	}
function Qh(e, t) {
	;(t.value._routerState = e), t.children.forEach((n) => Qh(e, n))
}
function tw(e) {
	let t = e.children.length > 0 ? ` { ${e.children.map(tw).join(', ')} } ` : ''
	return `${e.value}${t}`
}
function Dh(e) {
	if (e.snapshot) {
		let t = e.snapshot,
			n = e._futureSnapshot
		;(e.snapshot = n),
			Nt(t.queryParams, n.queryParams) ||
				e.queryParamsSubject.next(n.queryParams),
			t.fragment !== n.fragment && e.fragmentSubject.next(n.fragment),
			Nt(t.params, n.params) || e.paramsSubject.next(n.params),
			KO(t.url, n.url) || e.urlSubject.next(n.url),
			Nt(t.data, n.data) || e.dataSubject.next(n.data)
	} else
		(e.snapshot = e._futureSnapshot), e.dataSubject.next(e._futureSnapshot.data)
}
function Hh(e, t) {
	let n = Nt(e.params, t.params) && JO(e.url, t.url),
		r = !e.parent != !t.parent
	return n && !r && (!e.parent || Hh(e.parent, t.parent))
}
function nw(e) {
	return typeof e.title == 'string' || e.title === null
}
var wk = new E(''),
	Jh = (() => {
		class e {
			activated = null
			get activatedComponentRef() {
				return this.activated
			}
			_activatedRoute = null
			name = x
			activateEvents = new me()
			deactivateEvents = new me()
			attachEvents = new me()
			detachEvents = new me()
			routerOutletData = $y(void 0)
			parentContexts = g(Ho)
			location = g(bn)
			changeDetector = g(St)
			inputBinder = g(Zc, { optional: !0 })
			supportsBindingToComponentInputs = !0
			ngOnChanges(n) {
				if (n.name) {
					let { firstChange: r, previousValue: i } = n.name
					if (r) return
					this.isTrackedInParentContexts(i) &&
						(this.deactivate(), this.parentContexts.onChildOutletDestroyed(i)),
						this.initializeOutletWithName()
				}
			}
			ngOnDestroy() {
				this.isTrackedInParentContexts(this.name) &&
					this.parentContexts.onChildOutletDestroyed(this.name),
					this.inputBinder?.unsubscribeFromRouteData(this)
			}
			isTrackedInParentContexts(n) {
				return this.parentContexts.getContext(n)?.outlet === this
			}
			ngOnInit() {
				this.initializeOutletWithName()
			}
			initializeOutletWithName() {
				if (
					(this.parentContexts.onChildOutletCreated(this.name, this),
					this.activated)
				)
					return
				let n = this.parentContexts.getContext(this.name)
				n?.route &&
					(n.attachRef
						? this.attach(n.attachRef, n.route)
						: this.activateWith(n.route, n.injector))
			}
			get isActivated() {
				return !!this.activated
			}
			get component() {
				if (!this.activated) throw new w(4012, !1)
				return this.activated.instance
			}
			get activatedRoute() {
				if (!this.activated) throw new w(4012, !1)
				return this._activatedRoute
			}
			get activatedRouteData() {
				return this._activatedRoute ? this._activatedRoute.snapshot.data : {}
			}
			detach() {
				if (!this.activated) throw new w(4012, !1)
				this.location.detach()
				let n = this.activated
				return (
					(this.activated = null),
					(this._activatedRoute = null),
					this.detachEvents.emit(n.instance),
					n
				)
			}
			attach(n, r) {
				;(this.activated = n),
					(this._activatedRoute = r),
					this.location.insert(n.hostView),
					this.inputBinder?.bindActivatedRouteToOutletComponent(this),
					this.attachEvents.emit(n.instance)
			}
			deactivate() {
				if (this.activated) {
					let n = this.component
					this.activated.destroy(),
						(this.activated = null),
						(this._activatedRoute = null),
						this.deactivateEvents.emit(n)
				}
			}
			activateWith(n, r) {
				if (this.isActivated) throw new w(4013, !1)
				this._activatedRoute = n
				let i = this.location,
					s = n.snapshot.component,
					a = this.parentContexts.getOrCreateContext(this.name).children,
					c = new zh(n, a, i.injector, this.routerOutletData)
				;(this.activated = i.createComponent(s, {
					index: i.length,
					injector: c,
					environmentInjector: r,
				})),
					this.changeDetector.markForCheck(),
					this.inputBinder?.bindActivatedRouteToOutletComponent(this),
					this.activateEvents.emit(this.activated.instance)
			}
			static ɵfac = function (r) {
				return new (r || e)()
			}
			static ɵdir = Ce({
				type: e,
				selectors: [['router-outlet']],
				inputs: { name: 'name', routerOutletData: [1, 'routerOutletData'] },
				outputs: {
					activateEvents: 'activate',
					deactivateEvents: 'deactivate',
					attachEvents: 'attach',
					detachEvents: 'detach',
				},
				exportAs: ['outlet'],
				features: [or],
			})
		}
		return e
	})(),
	zh = class e {
		route
		childContexts
		parent
		outletData
		__ngOutletInjector(t) {
			return new e(this.route, this.childContexts, t, this.outletData)
		}
		constructor(t, n, r, i) {
			;(this.route = t),
				(this.childContexts = n),
				(this.parent = r),
				(this.outletData = i)
		}
		get(t, n) {
			return t === kt
				? this.route
				: t === Ho
				? this.childContexts
				: t === wk
				? this.outletData
				: this.parent.get(t, n)
		}
	},
	Zc = new E(''),
	PI = (() => {
		class e {
			outletDataSubscriptions = new Map()
			bindActivatedRouteToOutletComponent(n) {
				this.unsubscribeFromRouteData(n), this.subscribeToRouteData(n)
			}
			unsubscribeFromRouteData(n) {
				this.outletDataSubscriptions.get(n)?.unsubscribe(),
					this.outletDataSubscriptions.delete(n)
			}
			subscribeToRouteData(n) {
				let { activatedRoute: r } = n,
					i = Gi([r.queryParams, r.params, r.data])
						.pipe(
							Re(
								([o, s, a], c) => (
									(a = y(y(y({}, o), s), a)),
									c === 0 ? C(a) : Promise.resolve(a)
								)
							)
						)
						.subscribe((o) => {
							if (
								!n.isActivated ||
								!n.activatedComponentRef ||
								n.activatedRoute !== r ||
								r.component === null
							) {
								this.unsubscribeFromRouteData(n)
								return
							}
							let s = N_(r.component)
							if (!s) {
								this.unsubscribeFromRouteData(n)
								return
							}
							for (let { templateName: a } of s.inputs)
								n.activatedComponentRef.setInput(a, o[a])
						})
				this.outletDataSubscriptions.set(n, i)
			}
			static ɵfac = function (r) {
				return new (r || e)()
			}
			static ɵprov = _({ token: e, factory: e.ɵfac })
		}
		return e
	})()
function Dk(e, t, n) {
	let r = Po(e, t._root, n ? n._root : void 0)
	return new zc(r, t)
}
function Po(e, t, n) {
	if (n && e.shouldReuseRoute(t.value, n.value.snapshot)) {
		let r = n.value
		r._futureSnapshot = t.value
		let i = bk(e, t, n)
		return new Be(r, i)
	} else {
		if (e.shouldAttach(t.value)) {
			let o = e.retrieve(t.value)
			if (o !== null) {
				let s = o.route
				return (
					(s.value._futureSnapshot = t.value),
					(s.children = t.children.map((a) => Po(e, a))),
					s
				)
			}
		}
		let r = Ck(t.value),
			i = t.children.map((o) => Po(e, o))
		return new Be(r, i)
	}
}
function bk(e, t, n) {
	return t.children.map((r) => {
		for (let i of n.children)
			if (e.shouldReuseRoute(r.value, i.value.snapshot)) return Po(e, r, i)
		return Po(e, r)
	})
}
function Ck(e) {
	return new kt(
		new ee(e.url),
		new ee(e.params),
		new ee(e.queryParams),
		new ee(e.fragment),
		new ee(e.data),
		e.outlet,
		e.component,
		e
	)
}
var Fo = class {
		redirectTo
		navigationBehaviorOptions
		constructor(t, n) {
			;(this.redirectTo = t), (this.navigationBehaviorOptions = n)
		}
	},
	rw = 'ngNavigationCancelingError'
function qc(e, t) {
	let { redirectTo: n, navigationBehaviorOptions: r } = fr(t)
			? { redirectTo: t, navigationBehaviorOptions: void 0 }
			: t,
		i = iw(!1, $e.Redirect)
	return (i.url = n), (i.navigationBehaviorOptions = r), i
}
function iw(e, t) {
	let n = new Error(`NavigationCancelingError: ${e || ''}`)
	return (n[rw] = !0), (n.cancellationCode = t), n
}
function Tk(e) {
	return ow(e) && fr(e.url)
}
function ow(e) {
	return !!e && e[rw]
}
var Sk = (e, t, n, r) =>
		k(
			(i) => (
				new Wh(t, i.targetRouterState, i.currentRouterState, n, r).activate(e),
				i
			)
		),
	Wh = class {
		routeReuseStrategy
		futureState
		currState
		forwardEvent
		inputBindingEnabled
		constructor(t, n, r, i, o) {
			;(this.routeReuseStrategy = t),
				(this.futureState = n),
				(this.currState = r),
				(this.forwardEvent = i),
				(this.inputBindingEnabled = o)
		}
		activate(t) {
			let n = this.futureState._root,
				r = this.currState ? this.currState._root : null
			this.deactivateChildRoutes(n, r, t),
				Dh(this.futureState.root),
				this.activateChildRoutes(n, r, t)
		}
		deactivateChildRoutes(t, n, r) {
			let i = vi(n)
			t.children.forEach((o) => {
				let s = o.value.outlet
				this.deactivateRoutes(o, i[s], r), delete i[s]
			}),
				Object.values(i).forEach((o) => {
					this.deactivateRouteAndItsChildren(o, r)
				})
		}
		deactivateRoutes(t, n, r) {
			let i = t.value,
				o = n ? n.value : null
			if (i === o)
				if (i.component) {
					let s = r.getContext(i.outlet)
					s && this.deactivateChildRoutes(t, n, s.children)
				} else this.deactivateChildRoutes(t, n, r)
			else o && this.deactivateRouteAndItsChildren(n, r)
		}
		deactivateRouteAndItsChildren(t, n) {
			t.value.component &&
			this.routeReuseStrategy.shouldDetach(t.value.snapshot)
				? this.detachAndStoreRouteSubtree(t, n)
				: this.deactivateRouteAndOutlet(t, n)
		}
		detachAndStoreRouteSubtree(t, n) {
			let r = n.getContext(t.value.outlet),
				i = r && t.value.component ? r.children : n,
				o = vi(t)
			for (let s of Object.values(o)) this.deactivateRouteAndItsChildren(s, i)
			if (r && r.outlet) {
				let s = r.outlet.detach(),
					a = r.children.onOutletDeactivated()
				this.routeReuseStrategy.store(t.value.snapshot, {
					componentRef: s,
					route: t,
					contexts: a,
				})
			}
		}
		deactivateRouteAndOutlet(t, n) {
			let r = n.getContext(t.value.outlet),
				i = r && t.value.component ? r.children : n,
				o = vi(t)
			for (let s of Object.values(o)) this.deactivateRouteAndItsChildren(s, i)
			r &&
				(r.outlet && (r.outlet.deactivate(), r.children.onOutletDeactivated()),
				(r.attachRef = null),
				(r.route = null))
		}
		activateChildRoutes(t, n, r) {
			let i = vi(n)
			t.children.forEach((o) => {
				this.activateRoutes(o, i[o.value.outlet], r),
					this.forwardEvent(new jh(o.value.snapshot))
			}),
				t.children.length && this.forwardEvent(new Lh(t.value.snapshot))
		}
		activateRoutes(t, n, r) {
			let i = t.value,
				o = n ? n.value : null
			if ((Dh(i), i === o))
				if (i.component) {
					let s = r.getOrCreateContext(i.outlet)
					this.activateChildRoutes(t, n, s.children)
				} else this.activateChildRoutes(t, n, r)
			else if (i.component) {
				let s = r.getOrCreateContext(i.outlet)
				if (this.routeReuseStrategy.shouldAttach(i.snapshot)) {
					let a = this.routeReuseStrategy.retrieve(i.snapshot)
					this.routeReuseStrategy.store(i.snapshot, null),
						s.children.onOutletReAttached(a.contexts),
						(s.attachRef = a.componentRef),
						(s.route = a.route.value),
						s.outlet && s.outlet.attach(a.componentRef, a.route.value),
						Dh(a.route.value),
						this.activateChildRoutes(t, null, s.children)
				} else
					(s.attachRef = null),
						(s.route = i),
						s.outlet && s.outlet.activateWith(i, s.injector),
						this.activateChildRoutes(t, null, s.children)
			} else this.activateChildRoutes(t, null, r)
		}
	},
	Kc = class {
		path
		route
		constructor(t) {
			;(this.path = t), (this.route = this.path[this.path.length - 1])
		}
	},
	_i = class {
		component
		route
		constructor(t, n) {
			;(this.component = t), (this.route = n)
		}
	}
function Ak(e, t, n) {
	let r = e._root,
		i = t ? t._root : null
	return Ao(r, i, n, [r.value])
}
function Mk(e) {
	let t = e.routeConfig ? e.routeConfig.canActivateChild : null
	return !t || t.length === 0 ? null : { node: e, guards: t }
}
function Ti(e, t) {
	let n = Symbol(),
		r = t.get(e, n)
	return r === n ? (typeof e == 'function' && !Pv(e) ? e : t.get(e)) : r
}
function Ao(
	e,
	t,
	n,
	r,
	i = { canDeactivateChecks: [], canActivateChecks: [] }
) {
	let o = vi(t)
	return (
		e.children.forEach((s) => {
			Rk(s, o[s.value.outlet], n, r.concat([s.value]), i),
				delete o[s.value.outlet]
		}),
		Object.entries(o).forEach(([s, a]) => No(a, n.getContext(s), i)),
		i
	)
}
function Rk(
	e,
	t,
	n,
	r,
	i = { canDeactivateChecks: [], canActivateChecks: [] }
) {
	let o = e.value,
		s = t ? t.value : null,
		a = n ? n.getContext(e.value.outlet) : null
	if (s && o.routeConfig === s.routeConfig) {
		let c = Nk(s, o, o.routeConfig.runGuardsAndResolvers)
		c
			? i.canActivateChecks.push(new Kc(r))
			: ((o.data = s.data), (o._resolvedData = s._resolvedData)),
			o.component ? Ao(e, t, a ? a.children : null, r, i) : Ao(e, t, n, r, i),
			c &&
				a &&
				a.outlet &&
				a.outlet.isActivated &&
				i.canDeactivateChecks.push(new _i(a.outlet.component, s))
	} else
		s && No(t, a, i),
			i.canActivateChecks.push(new Kc(r)),
			o.component
				? Ao(e, null, a ? a.children : null, r, i)
				: Ao(e, null, n, r, i)
	return i
}
function Nk(e, t, n) {
	if (typeof n == 'function') return n(e, t)
	switch (n) {
		case 'pathParamsChange':
			return !dr(e.url, t.url)
		case 'pathParamsOrQueryParamsChange':
			return !dr(e.url, t.url) || !Nt(e.queryParams, t.queryParams)
		case 'always':
			return !0
		case 'paramsOrQueryParamsChange':
			return !Hh(e, t) || !Nt(e.queryParams, t.queryParams)
		case 'paramsChange':
		default:
			return !Hh(e, t)
	}
}
function No(e, t, n) {
	let r = vi(e),
		i = e.value
	Object.entries(r).forEach(([o, s]) => {
		i.component
			? t
				? No(s, t.children.getContext(o), n)
				: No(s, null, n)
			: No(s, t, n)
	}),
		i.component
			? t && t.outlet && t.outlet.isActivated
				? n.canDeactivateChecks.push(new _i(t.outlet.component, i))
				: n.canDeactivateChecks.push(new _i(null, i))
			: n.canDeactivateChecks.push(new _i(null, i))
}
function zo(e) {
	return typeof e == 'function'
}
function Ok(e) {
	return typeof e == 'boolean'
}
function kk(e) {
	return e && zo(e.canLoad)
}
function xk(e) {
	return e && zo(e.canActivate)
}
function Pk(e) {
	return e && zo(e.canActivateChild)
}
function Fk(e) {
	return e && zo(e.canDeactivate)
}
function Lk(e) {
	return e && zo(e.canMatch)
}
function sw(e) {
	return e instanceof Xe || e?.name === 'EmptyError'
}
var xc = Symbol('INITIAL_VALUE')
function Ci() {
	return Re((e) =>
		Gi(e.map((t) => t.pipe(Bt(1), yl(xc)))).pipe(
			k((t) => {
				for (let n of t)
					if (n !== !0) {
						if (n === xc) return xc
						if (n === !1 || Vk(n)) return n
					}
				return !0
			}),
			Me((t) => t !== xc),
			Bt(1)
		)
	)
}
function Vk(e) {
	return fr(e) || e instanceof Fo
}
function jk(e, t) {
	return se((n) => {
		let {
			targetSnapshot: r,
			currentSnapshot: i,
			guards: { canActivateChecks: o, canDeactivateChecks: s },
		} = n
		return s.length === 0 && o.length === 0
			? C(L(y({}, n), { guardsResult: !0 }))
			: Uk(s, r, i, e).pipe(
					se((a) => (a && Ok(a) ? Bk(r, o, e, t) : C(a))),
					k((a) => L(y({}, n), { guardsResult: a }))
			  )
	})
}
function Uk(e, t, n, r) {
	return Z(e).pipe(
		se((i) => Gk(i.component, i.route, n, t, r)),
		$t((i) => i !== !0, !0)
	)
}
function Bk(e, t, n, r) {
	return Z(t).pipe(
		Ut((i) =>
			Or(
				Hk(i.route.parent, r),
				$k(i.route, r),
				Wk(e, i.path, n),
				zk(e, i.route, n)
			)
		),
		$t((i) => i !== !0, !0)
	)
}
function $k(e, t) {
	return e !== null && t && t(new Vh(e)), C(!0)
}
function Hk(e, t) {
	return e !== null && t && t(new Fh(e)), C(!0)
}
function zk(e, t, n) {
	let r = t.routeConfig ? t.routeConfig.canActivate : null
	if (!r || r.length === 0) return C(!0)
	let i = r.map((o) =>
		zs(() => {
			let s = $o(t) ?? n,
				a = Ti(o, s),
				c = xk(a) ? a.canActivate(t, e) : he(s, () => a(t, e))
			return xn(c).pipe($t())
		})
	)
	return C(i).pipe(Ci())
}
function Wk(e, t, n) {
	let r = t[t.length - 1],
		o = t
			.slice(0, t.length - 1)
			.reverse()
			.map((s) => Mk(s))
			.filter((s) => s !== null)
			.map((s) =>
				zs(() => {
					let a = s.guards.map((c) => {
						let u = $o(s.node) ?? n,
							l = Ti(c, u),
							d = Pk(l) ? l.canActivateChild(r, e) : he(u, () => l(r, e))
						return xn(d).pipe($t())
					})
					return C(a).pipe(Ci())
				})
			)
	return C(o).pipe(Ci())
}
function Gk(e, t, n, r, i) {
	let o = t && t.routeConfig ? t.routeConfig.canDeactivate : null
	if (!o || o.length === 0) return C(!0)
	let s = o.map((a) => {
		let c = $o(t) ?? i,
			u = Ti(a, c),
			l = Fk(u) ? u.canDeactivate(e, t, n, r) : he(c, () => u(e, t, n, r))
		return xn(l).pipe($t())
	})
	return C(s).pipe(Ci())
}
function qk(e, t, n, r) {
	let i = t.canLoad
	if (i === void 0 || i.length === 0) return C(!0)
	let o = i.map((s) => {
		let a = Ti(s, e),
			c = kk(a) ? a.canLoad(t, n) : he(e, () => a(t, n))
		return xn(c)
	})
	return C(o).pipe(Ci(), aw(r))
}
function aw(e) {
	return sl(
		J((t) => {
			if (typeof t != 'boolean') throw qc(e, t)
		}),
		k((t) => t === !0)
	)
}
function Kk(e, t, n, r) {
	let i = t.canMatch
	if (!i || i.length === 0) return C(!0)
	let o = i.map((s) => {
		let a = Ti(s, e),
			c = Lk(a) ? a.canMatch(t, n) : he(e, () => a(t, n))
		return xn(c)
	})
	return C(o).pipe(Ci(), aw(r))
}
var Lo = class {
		segmentGroup
		constructor(t) {
			this.segmentGroup = t || null
		}
	},
	Vo = class extends Error {
		urlTree
		constructor(t) {
			super(), (this.urlTree = t)
		}
	}
function mi(e) {
	return yt(new Lo(e))
}
function Yk(e) {
	return yt(new w(4e3, !1))
}
function Zk(e) {
	return yt(iw(!1, $e.GuardRejected))
}
var Gh = class {
		urlSerializer
		urlTree
		constructor(t, n) {
			;(this.urlSerializer = t), (this.urlTree = n)
		}
		lineralizeSegments(t, n) {
			let r = [],
				i = n.root
			for (;;) {
				if (((r = r.concat(i.segments)), i.numberOfChildren === 0)) return C(r)
				if (i.numberOfChildren > 1 || !i.children[x])
					return Yk(`${t.redirectTo}`)
				i = i.children[x]
			}
		}
		applyRedirectCommands(t, n, r, i, o) {
			if (typeof n != 'string') {
				let a = n,
					{
						queryParams: c,
						fragment: u,
						routeConfig: l,
						url: d,
						outlet: h,
						params: f,
						data: m,
						title: v,
					} = i,
					D = he(o, () =>
						a({
							params: f,
							data: m,
							queryParams: c,
							fragment: u,
							routeConfig: l,
							url: d,
							outlet: h,
							title: v,
						})
					)
				if (D instanceof tn) throw new Vo(D)
				n = D
			}
			let s = this.applyRedirectCreateUrlTree(
				n,
				this.urlSerializer.parse(n),
				t,
				r
			)
			if (n[0] === '/') throw new Vo(s)
			return s
		}
		applyRedirectCreateUrlTree(t, n, r, i) {
			let o = this.createSegmentGroup(t, n.root, r, i)
			return new tn(
				o,
				this.createQueryParams(n.queryParams, this.urlTree.queryParams),
				n.fragment
			)
		}
		createQueryParams(t, n) {
			let r = {}
			return (
				Object.entries(t).forEach(([i, o]) => {
					if (typeof o == 'string' && o[0] === ':') {
						let a = o.substring(1)
						r[i] = n[a]
					} else r[i] = o
				}),
				r
			)
		}
		createSegmentGroup(t, n, r, i) {
			let o = this.createSegments(t, n.segments, r, i),
				s = {}
			return (
				Object.entries(n.children).forEach(([a, c]) => {
					s[a] = this.createSegmentGroup(t, c, r, i)
				}),
				new q(o, s)
			)
		}
		createSegments(t, n, r, i) {
			return n.map((o) =>
				o.path[0] === ':' ? this.findPosParam(t, o, i) : this.findOrReturn(o, r)
			)
		}
		findPosParam(t, n, r) {
			let i = r[n.path.substring(1)]
			if (!i) throw new w(4001, !1)
			return i
		}
		findOrReturn(t, n) {
			let r = 0
			for (let i of n) {
				if (i.path === t.path) return n.splice(r), i
				r++
			}
			return t
		}
	},
	qh = {
		matched: !1,
		consumedSegments: [],
		remainingSegments: [],
		parameters: {},
		positionalParamSegments: {},
	}
function Qk(e, t, n, r, i) {
	let o = cw(e, t, n)
	return o.matched
		? ((r = Ek(t, r)),
		  Kk(r, t, n, i).pipe(k((s) => (s === !0 ? o : y({}, qh)))))
		: C(o)
}
function cw(e, t, n) {
	if (t.path === '**') return Jk(n)
	if (t.path === '')
		return t.pathMatch === 'full' && (e.hasChildren() || n.length > 0)
			? y({}, qh)
			: {
					matched: !0,
					consumedSegments: [],
					remainingSegments: n,
					parameters: {},
					positionalParamSegments: {},
			  }
	let i = (t.matcher || qO)(n, e, t)
	if (!i) return y({}, qh)
	let o = {}
	Object.entries(i.posParams ?? {}).forEach(([a, c]) => {
		o[a] = c.path
	})
	let s =
		i.consumed.length > 0
			? y(y({}, o), i.consumed[i.consumed.length - 1].parameters)
			: o
	return {
		matched: !0,
		consumedSegments: i.consumed,
		remainingSegments: n.slice(i.consumed.length),
		parameters: s,
		positionalParamSegments: i.posParams ?? {},
	}
}
function Jk(e) {
	return {
		matched: !0,
		parameters: e.length > 0 ? BI(e).parameters : {},
		consumedSegments: e,
		remainingSegments: [],
		positionalParamSegments: {},
	}
}
function FI(e, t, n, r) {
	return n.length > 0 && tx(e, n, r)
		? {
				segmentGroup: new q(t, ex(r, new q(n, e.children))),
				slicedSegments: [],
		  }
		: n.length === 0 && nx(e, n, r)
		? {
				segmentGroup: new q(e.segments, Xk(e, n, r, e.children)),
				slicedSegments: n,
		  }
		: { segmentGroup: new q(e.segments, e.children), slicedSegments: n }
}
function Xk(e, t, n, r) {
	let i = {}
	for (let o of n)
		if (Qc(e, t, o) && !r[lt(o)]) {
			let s = new q([], {})
			i[lt(o)] = s
		}
	return y(y({}, r), i)
}
function ex(e, t) {
	let n = {}
	n[x] = t
	for (let r of e)
		if (r.path === '' && lt(r) !== x) {
			let i = new q([], {})
			n[lt(r)] = i
		}
	return n
}
function tx(e, t, n) {
	return n.some((r) => Qc(e, t, r) && lt(r) !== x)
}
function nx(e, t, n) {
	return n.some((r) => Qc(e, t, r))
}
function Qc(e, t, n) {
	return (e.hasChildren() || t.length > 0) && n.pathMatch === 'full'
		? !1
		: n.path === ''
}
function rx(e, t, n) {
	return t.length === 0 && !e.children[n]
}
var Kh = class {}
function ix(e, t, n, r, i, o, s = 'emptyOnly') {
	return new Yh(e, t, n, r, i, s, o).recognize()
}
var ox = 31,
	Yh = class {
		injector
		configLoader
		rootComponentType
		config
		urlTree
		paramsInheritanceStrategy
		urlSerializer
		applyRedirects
		absoluteRedirectCount = 0
		allowRedirects = !0
		constructor(t, n, r, i, o, s, a) {
			;(this.injector = t),
				(this.configLoader = n),
				(this.rootComponentType = r),
				(this.config = i),
				(this.urlTree = o),
				(this.paramsInheritanceStrategy = s),
				(this.urlSerializer = a),
				(this.applyRedirects = new Gh(this.urlSerializer, this.urlTree))
		}
		noMatchError(t) {
			return new w(4002, `'${t.segmentGroup}'`)
		}
		recognize() {
			let t = FI(this.urlTree.root, [], [], this.config).segmentGroup
			return this.match(t).pipe(
				k(({ children: n, rootSnapshot: r }) => {
					let i = new Be(r, n),
						o = new Gc('', i),
						s = fk(r, [], this.urlTree.queryParams, this.urlTree.fragment)
					return (
						(s.queryParams = this.urlTree.queryParams),
						(o.url = this.urlSerializer.serialize(s)),
						{ state: o, tree: s }
					)
				})
			)
		}
		match(t) {
			let n = new Ei(
				[],
				Object.freeze({}),
				Object.freeze(y({}, this.urlTree.queryParams)),
				this.urlTree.fragment,
				Object.freeze({}),
				x,
				this.rootComponentType,
				null,
				{}
			)
			return this.processSegmentGroup(this.injector, this.config, t, x, n).pipe(
				k((r) => ({ children: r, rootSnapshot: n })),
				et((r) => {
					if (r instanceof Vo)
						return (this.urlTree = r.urlTree), this.match(r.urlTree.root)
					throw r instanceof Lo ? this.noMatchError(r) : r
				})
			)
		}
		processSegmentGroup(t, n, r, i, o) {
			return r.segments.length === 0 && r.hasChildren()
				? this.processChildren(t, n, r, o)
				: this.processSegment(t, n, r, r.segments, i, !0, o).pipe(
						k((s) => (s instanceof Be ? [s] : []))
				  )
		}
		processChildren(t, n, r, i) {
			let o = []
			for (let s of Object.keys(r.children))
				s === 'primary' ? o.unshift(s) : o.push(s)
			return Z(o).pipe(
				Ut((s) => {
					let a = r.children[s],
						c = _k(n, s)
					return this.processSegmentGroup(t, c, a, s, i)
				}),
				vl((s, a) => (s.push(...a), s)),
				hn(null),
				ml(),
				se((s) => {
					if (s === null) return mi(r)
					let a = uw(s)
					return sx(a), C(a)
				})
			)
		}
		processSegment(t, n, r, i, o, s, a) {
			return Z(n).pipe(
				Ut((c) =>
					this.processSegmentAgainstRoute(
						c._injector ?? t,
						n,
						c,
						r,
						i,
						o,
						s,
						a
					).pipe(
						et((u) => {
							if (u instanceof Lo) return C(null)
							throw u
						})
					)
				),
				$t((c) => !!c),
				et((c) => {
					if (sw(c)) return rx(r, i, o) ? C(new Kh()) : mi(r)
					throw c
				})
			)
		}
		processSegmentAgainstRoute(t, n, r, i, o, s, a, c) {
			return lt(r) !== s && (s === x || !Qc(i, o, r))
				? mi(i)
				: r.redirectTo === void 0
				? this.matchSegmentAgainstRoute(t, i, r, o, s, c)
				: this.allowRedirects && a
				? this.expandSegmentAgainstRouteUsingRedirect(t, i, n, r, o, s, c)
				: mi(i)
		}
		expandSegmentAgainstRouteUsingRedirect(t, n, r, i, o, s, a) {
			let {
				matched: c,
				parameters: u,
				consumedSegments: l,
				positionalParamSegments: d,
				remainingSegments: h,
			} = cw(n, i, o)
			if (!c) return mi(n)
			typeof i.redirectTo == 'string' &&
				i.redirectTo[0] === '/' &&
				(this.absoluteRedirectCount++,
				this.absoluteRedirectCount > ox && (this.allowRedirects = !1))
			let f = new Ei(
					o,
					u,
					Object.freeze(y({}, this.urlTree.queryParams)),
					this.urlTree.fragment,
					LI(i),
					lt(i),
					i.component ?? i._loadedComponent ?? null,
					i,
					VI(i)
				),
				m = Wc(f, a, this.paramsInheritanceStrategy)
			;(f.params = Object.freeze(m.params)), (f.data = Object.freeze(m.data))
			let v = this.applyRedirects.applyRedirectCommands(
				l,
				i.redirectTo,
				d,
				f,
				t
			)
			return this.applyRedirects
				.lineralizeSegments(i, v)
				.pipe(se((D) => this.processSegment(t, r, n, D.concat(h), s, !1, a)))
		}
		matchSegmentAgainstRoute(t, n, r, i, o, s) {
			let a = Qk(n, r, i, t, this.urlSerializer)
			return (
				r.path === '**' && (n.children = {}),
				a.pipe(
					Re((c) =>
						c.matched
							? ((t = r._injector ?? t),
							  this.getChildConfig(t, r, i).pipe(
									Re(({ routes: u }) => {
										let l = r._loadedInjector ?? t,
											{
												parameters: d,
												consumedSegments: h,
												remainingSegments: f,
											} = c,
											m = new Ei(
												h,
												d,
												Object.freeze(y({}, this.urlTree.queryParams)),
												this.urlTree.fragment,
												LI(r),
												lt(r),
												r.component ?? r._loadedComponent ?? null,
												r,
												VI(r)
											),
											v = Wc(m, s, this.paramsInheritanceStrategy)
										;(m.params = Object.freeze(v.params)),
											(m.data = Object.freeze(v.data))
										let { segmentGroup: D, slicedSegments: T } = FI(n, h, f, u)
										if (T.length === 0 && D.hasChildren())
											return this.processChildren(l, u, D, m).pipe(
												k((W) => new Be(m, W))
											)
										if (u.length === 0 && T.length === 0)
											return C(new Be(m, []))
										let ce = lt(r) === o
										return this.processSegment(
											l,
											u,
											D,
											T,
											ce ? x : o,
											!0,
											m
										).pipe(k((W) => new Be(m, W instanceof Be ? [W] : [])))
									})
							  ))
							: mi(n)
					)
				)
			)
		}
		getChildConfig(t, n, r) {
			return n.children
				? C({ routes: n.children, injector: t })
				: n.loadChildren
				? n._loadedRoutes !== void 0
					? C({ routes: n._loadedRoutes, injector: n._loadedInjector })
					: qk(t, n, r, this.urlSerializer).pipe(
							se((i) =>
								i
									? this.configLoader.loadChildren(t, n).pipe(
											J((o) => {
												;(n._loadedRoutes = o.routes),
													(n._loadedInjector = o.injector)
											})
									  )
									: Zk(n)
							)
					  )
				: C({ routes: [], injector: t })
		}
	}
function sx(e) {
	e.sort((t, n) =>
		t.value.outlet === x
			? -1
			: n.value.outlet === x
			? 1
			: t.value.outlet.localeCompare(n.value.outlet)
	)
}
function ax(e) {
	let t = e.value.routeConfig
	return t && t.path === ''
}
function uw(e) {
	let t = [],
		n = new Set()
	for (let r of e) {
		if (!ax(r)) {
			t.push(r)
			continue
		}
		let i = t.find((o) => r.value.routeConfig === o.value.routeConfig)
		i !== void 0 ? (i.children.push(...r.children), n.add(i)) : t.push(r)
	}
	for (let r of n) {
		let i = uw(r.children)
		t.push(new Be(r.value, i))
	}
	return t.filter((r) => !n.has(r))
}
function LI(e) {
	return e.data || {}
}
function VI(e) {
	return e.resolve || {}
}
function cx(e, t, n, r, i, o) {
	return se((s) =>
		ix(e, t, n, r, s.extractedUrl, i, o).pipe(
			k(({ state: a, tree: c }) =>
				L(y({}, s), { targetSnapshot: a, urlAfterRedirects: c })
			)
		)
	)
}
function ux(e, t) {
	return se((n) => {
		let {
			targetSnapshot: r,
			guards: { canActivateChecks: i },
		} = n
		if (!i.length) return C(n)
		let o = new Set(i.map((c) => c.route)),
			s = new Set()
		for (let c of o) if (!s.has(c)) for (let u of lw(c)) s.add(u)
		let a = 0
		return Z(s).pipe(
			Ut((c) =>
				o.has(c)
					? lx(c, r, e, t)
					: ((c.data = Wc(c, c.parent, e).resolve), C(void 0))
			),
			J(() => a++),
			kr(1),
			se((c) => (a === s.size ? C(n) : Se))
		)
	})
}
function lw(e) {
	let t = e.children.map((n) => lw(n)).flat()
	return [e, ...t]
}
function lx(e, t, n, r) {
	let i = e.routeConfig,
		o = e._resolve
	return (
		i?.title !== void 0 && !nw(i) && (o[Uo] = i.title),
		dx(o, e, t, r).pipe(
			k(
				(s) => (
					(e._resolvedData = s), (e.data = Wc(e, e.parent, n).resolve), null
				)
			)
		)
	)
}
function dx(e, t, n, r) {
	let i = Th(e)
	if (i.length === 0) return C({})
	let o = {}
	return Z(i).pipe(
		se((s) =>
			fx(e[s], t, n, r).pipe(
				$t(),
				J((a) => {
					if (a instanceof Fo) throw qc(new wi(), a)
					o[s] = a
				})
			)
		),
		kr(1),
		k(() => o),
		et((s) => (sw(s) ? Se : yt(s)))
	)
}
function fx(e, t, n, r) {
	let i = $o(t) ?? r,
		o = Ti(e, i),
		s = o.resolve ? o.resolve(t, n) : he(i, () => o(t, n))
	return xn(s)
}
function bh(e) {
	return Re((t) => {
		let n = e(t)
		return n ? Z(n).pipe(k(() => t)) : C(t)
	})
}
var dw = (() => {
		class e {
			buildTitle(n) {
				let r,
					i = n.root
				for (; i !== void 0; )
					(r = this.getResolvedTitleForRoute(i) ?? r),
						(i = i.children.find((o) => o.outlet === x))
				return r
			}
			getResolvedTitleForRoute(n) {
				return n.data[Uo]
			}
			static ɵfac = function (r) {
				return new (r || e)()
			}
			static ɵprov = _({ token: e, factory: () => g(hx), providedIn: 'root' })
		}
		return e
	})(),
	hx = (() => {
		class e extends dw {
			title
			constructor(n) {
				super(), (this.title = n)
			}
			updateTitle(n) {
				let r = this.buildTitle(n)
				r !== void 0 && this.title.setTitle(r)
			}
			static ɵfac = function (r) {
				return new (r || e)(I(AI))
			}
			static ɵprov = _({ token: e, factory: e.ɵfac, providedIn: 'root' })
		}
		return e
	})(),
	Wo = new E('', { providedIn: 'root', factory: () => ({}) }),
	px = (() => {
		class e {
			static ɵfac = function (r) {
				return new (r || e)()
			}
			static ɵcmp = Tt({
				type: e,
				selectors: [['ng-component']],
				exportAs: ['emptyRouterOutlet'],
				decls: 1,
				vars: 0,
				template: function (r, i) {
					r & 1 && Ze(0, 'router-outlet')
				},
				dependencies: [Jh],
				encapsulation: 2,
			})
		}
		return e
	})()
function Xh(e) {
	let t = e.children && e.children.map(Xh),
		n = t ? L(y({}, e), { children: t }) : y({}, e)
	return (
		!n.component &&
			!n.loadComponent &&
			(t || n.loadChildren) &&
			n.outlet &&
			n.outlet !== x &&
			(n.component = px),
		n
	)
}
var jo = new E(''),
	ep = (() => {
		class e {
			componentLoaders = new WeakMap()
			childrenLoaders = new WeakMap()
			onLoadStartListener
			onLoadEndListener
			compiler = g(wc)
			loadComponent(n) {
				if (this.componentLoaders.get(n)) return this.componentLoaders.get(n)
				if (n._loadedComponent) return C(n._loadedComponent)
				this.onLoadStartListener && this.onLoadStartListener(n)
				let r = xn(n.loadComponent()).pipe(
						k(fw),
						J((o) => {
							this.onLoadEndListener && this.onLoadEndListener(n),
								(n._loadedComponent = o)
						}),
						pn(() => {
							this.componentLoaders.delete(n)
						})
					),
					i = new Sr(r, () => new ie()).pipe(Tr())
				return this.componentLoaders.set(n, i), i
			}
			loadChildren(n, r) {
				if (this.childrenLoaders.get(r)) return this.childrenLoaders.get(r)
				if (r._loadedRoutes)
					return C({ routes: r._loadedRoutes, injector: r._loadedInjector })
				this.onLoadStartListener && this.onLoadStartListener(r)
				let o = gx(r, this.compiler, n, this.onLoadEndListener).pipe(
						pn(() => {
							this.childrenLoaders.delete(r)
						})
					),
					s = new Sr(o, () => new ie()).pipe(Tr())
				return this.childrenLoaders.set(r, s), s
			}
			static ɵfac = function (r) {
				return new (r || e)()
			}
			static ɵprov = _({ token: e, factory: e.ɵfac, providedIn: 'root' })
		}
		return e
	})()
function gx(e, t, n, r) {
	return xn(e.loadChildren()).pipe(
		k(fw),
		se((i) =>
			i instanceof Of || Array.isArray(i) ? C(i) : Z(t.compileModuleAsync(i))
		),
		k((i) => {
			r && r(e)
			let o,
				s,
				a = !1
			return (
				Array.isArray(i)
					? ((s = i), (a = !0))
					: ((o = i.create(n).injector),
					  (s = o.get(jo, [], { optional: !0, self: !0 }).flat())),
				{ routes: s.map(Xh), injector: o }
			)
		})
	)
}
function mx(e) {
	return e && typeof e == 'object' && 'default' in e
}
function fw(e) {
	return mx(e) ? e.default : e
}
var tp = (() => {
		class e {
			static ɵfac = function (r) {
				return new (r || e)()
			}
			static ɵprov = _({ token: e, factory: () => g(vx), providedIn: 'root' })
		}
		return e
	})(),
	vx = (() => {
		class e {
			shouldProcessUrl(n) {
				return !0
			}
			extract(n) {
				return n
			}
			merge(n, r) {
				return n
			}
			static ɵfac = function (r) {
				return new (r || e)()
			}
			static ɵprov = _({ token: e, factory: e.ɵfac, providedIn: 'root' })
		}
		return e
	})(),
	hw = new E(''),
	pw = new E('')
function yx(e, t, n) {
	let r = e.get(pw),
		i = e.get(_e)
	return e.get(j).runOutsideAngular(() => {
		if (!i.startViewTransition || r.skipNextTransition)
			return (r.skipNextTransition = !1), new Promise((u) => setTimeout(u))
		let o,
			s = new Promise((u) => {
				o = u
			}),
			a = i.startViewTransition(() => (o(), Ex(e))),
			{ onViewTransitionCreated: c } = r
		return c && he(e, () => c({ transition: a, from: t, to: n })), s
	})
}
function Ex(e) {
	return new Promise((t) => {
		Qa({ read: () => setTimeout(t) }, { injector: e })
	})
}
var gw = new E(''),
	np = (() => {
		class e {
			currentNavigation = null
			currentTransition = null
			lastSuccessfulNavigation = null
			events = new ie()
			transitionAbortSubject = new ie()
			configLoader = g(ep)
			environmentInjector = g(fe)
			destroyRef = g(ri)
			urlSerializer = g(Bo)
			rootContexts = g(Ho)
			location = g(pi)
			inputBindingEnabled = g(Zc, { optional: !0 }) !== null
			titleStrategy = g(dw)
			options = g(Wo, { optional: !0 }) || {}
			paramsInheritanceStrategy =
				this.options.paramsInheritanceStrategy || 'emptyOnly'
			urlHandlingStrategy = g(tp)
			createViewTransition = g(hw, { optional: !0 })
			navigationErrorHandler = g(gw, { optional: !0 })
			navigationId = 0
			get hasRequestedNavigation() {
				return this.navigationId !== 0
			}
			transitions
			afterPreactivation = () => C(void 0)
			rootComponentType = null
			destroyed = !1
			constructor() {
				let n = (i) => this.events.next(new xh(i)),
					r = (i) => this.events.next(new Ph(i))
				;(this.configLoader.onLoadEndListener = r),
					(this.configLoader.onLoadStartListener = n),
					this.destroyRef.onDestroy(() => {
						this.destroyed = !0
					})
			}
			complete() {
				this.transitions?.complete()
			}
			handleNavigationRequest(n) {
				let r = ++this.navigationId
				this.transitions?.next(
					L(y(y({}, this.transitions.value), n), { id: r })
				)
			}
			setupNavigations(n, r, i) {
				return (
					(this.transitions = new ee({
						id: 0,
						currentUrlTree: r,
						currentRawUrl: r,
						extractedUrl: this.urlHandlingStrategy.extract(r),
						urlAfterRedirects: this.urlHandlingStrategy.extract(r),
						rawUrl: r,
						extras: {},
						resolve: () => {},
						reject: () => {},
						promise: Promise.resolve(!0),
						source: Ro,
						restoredState: null,
						currentSnapshot: i.snapshot,
						targetSnapshot: null,
						currentRouterState: i,
						targetRouterState: null,
						guards: { canActivateChecks: [], canDeactivateChecks: [] },
						guardsResult: null,
					})),
					this.transitions.pipe(
						Me((o) => o.id !== 0),
						k((o) =>
							L(y({}, o), {
								extractedUrl: this.urlHandlingStrategy.extract(o.rawUrl),
							})
						),
						Re((o) => {
							let s = !1,
								a = !1
							return C(o).pipe(
								Re((c) => {
									if (this.navigationId > o.id)
										return (
											this.cancelNavigationTransition(
												o,
												'',
												$e.SupersededByNewNavigation
											),
											Se
										)
									;(this.currentTransition = o),
										(this.currentNavigation = {
											id: c.id,
											initialUrl: c.rawUrl,
											extractedUrl: c.extractedUrl,
											targetBrowserUrl:
												typeof c.extras.browserUrl == 'string'
													? this.urlSerializer.parse(c.extras.browserUrl)
													: c.extras.browserUrl,
											trigger: c.source,
											extras: c.extras,
											previousNavigation: this.lastSuccessfulNavigation
												? L(y({}, this.lastSuccessfulNavigation), {
														previousNavigation: null,
												  })
												: null,
										})
									let u =
											!n.navigated ||
											this.isUpdatingInternalState() ||
											this.isUpdatedBrowserUrl(),
										l = c.extras.onSameUrlNavigation ?? n.onSameUrlNavigation
									if (!u && l !== 'reload') {
										let d = ''
										return (
											this.events.next(
												new kn(
													c.id,
													this.urlSerializer.serialize(c.rawUrl),
													d,
													Uc.IgnoredSameUrlNavigation
												)
											),
											c.resolve(!1),
											Se
										)
									}
									if (this.urlHandlingStrategy.shouldProcessUrl(c.rawUrl))
										return C(c).pipe(
											Re((d) => {
												let h = this.transitions?.getValue()
												return (
													this.events.next(
														new Di(
															d.id,
															this.urlSerializer.serialize(d.extractedUrl),
															d.source,
															d.restoredState
														)
													),
													h !== this.transitions?.getValue()
														? Se
														: Promise.resolve(d)
												)
											}),
											cx(
												this.environmentInjector,
												this.configLoader,
												this.rootComponentType,
												n.config,
												this.urlSerializer,
												this.paramsInheritanceStrategy
											),
											J((d) => {
												;(o.targetSnapshot = d.targetSnapshot),
													(o.urlAfterRedirects = d.urlAfterRedirects),
													(this.currentNavigation = L(
														y({}, this.currentNavigation),
														{ finalUrl: d.urlAfterRedirects }
													))
												let h = new Bc(
													d.id,
													this.urlSerializer.serialize(d.extractedUrl),
													this.urlSerializer.serialize(d.urlAfterRedirects),
													d.targetSnapshot
												)
												this.events.next(h)
											})
										)
									if (
										u &&
										this.urlHandlingStrategy.shouldProcessUrl(c.currentRawUrl)
									) {
										let {
												id: d,
												extractedUrl: h,
												source: f,
												restoredState: m,
												extras: v,
											} = c,
											D = new Di(d, this.urlSerializer.serialize(h), f, m)
										this.events.next(D)
										let T = ew(this.rootComponentType).snapshot
										return (
											(this.currentTransition = o =
												L(y({}, c), {
													targetSnapshot: T,
													urlAfterRedirects: h,
													extras: L(y({}, v), {
														skipLocationChange: !1,
														replaceUrl: !1,
													}),
												})),
											(this.currentNavigation.finalUrl = h),
											C(o)
										)
									} else {
										let d = ''
										return (
											this.events.next(
												new kn(
													c.id,
													this.urlSerializer.serialize(c.extractedUrl),
													d,
													Uc.IgnoredByUrlHandlingStrategy
												)
											),
											c.resolve(!1),
											Se
										)
									}
								}),
								J((c) => {
									let u = new Rh(
										c.id,
										this.urlSerializer.serialize(c.extractedUrl),
										this.urlSerializer.serialize(c.urlAfterRedirects),
										c.targetSnapshot
									)
									this.events.next(u)
								}),
								k(
									(c) => (
										(this.currentTransition = o =
											L(y({}, c), {
												guards: Ak(
													c.targetSnapshot,
													c.currentSnapshot,
													this.rootContexts
												),
											})),
										o
									)
								),
								jk(this.environmentInjector, (c) => this.events.next(c)),
								J((c) => {
									if (
										((o.guardsResult = c.guardsResult),
										c.guardsResult && typeof c.guardsResult != 'boolean')
									)
										throw qc(this.urlSerializer, c.guardsResult)
									let u = new Nh(
										c.id,
										this.urlSerializer.serialize(c.extractedUrl),
										this.urlSerializer.serialize(c.urlAfterRedirects),
										c.targetSnapshot,
										!!c.guardsResult
									)
									this.events.next(u)
								}),
								Me((c) =>
									c.guardsResult
										? !0
										: (this.cancelNavigationTransition(c, '', $e.GuardRejected),
										  !1)
								),
								bh((c) => {
									if (c.guards.canActivateChecks.length)
										return C(c).pipe(
											J((u) => {
												let l = new Oh(
													u.id,
													this.urlSerializer.serialize(u.extractedUrl),
													this.urlSerializer.serialize(u.urlAfterRedirects),
													u.targetSnapshot
												)
												this.events.next(l)
											}),
											Re((u) => {
												let l = !1
												return C(u).pipe(
													ux(
														this.paramsInheritanceStrategy,
														this.environmentInjector
													),
													J({
														next: () => (l = !0),
														complete: () => {
															l ||
																this.cancelNavigationTransition(
																	u,
																	'',
																	$e.NoDataFromResolver
																)
														},
													})
												)
											}),
											J((u) => {
												let l = new kh(
													u.id,
													this.urlSerializer.serialize(u.extractedUrl),
													this.urlSerializer.serialize(u.urlAfterRedirects),
													u.targetSnapshot
												)
												this.events.next(l)
											})
										)
								}),
								bh((c) => {
									let u = (l) => {
										let d = []
										l.routeConfig?.loadComponent &&
											!l.routeConfig._loadedComponent &&
											d.push(
												this.configLoader.loadComponent(l.routeConfig).pipe(
													J((h) => {
														l.component = h
													}),
													k(() => {})
												)
											)
										for (let h of l.children) d.push(...u(h))
										return d
									}
									return Gi(u(c.targetSnapshot.root)).pipe(hn(null), Bt(1))
								}),
								bh(() => this.afterPreactivation()),
								Re(() => {
									let { currentSnapshot: c, targetSnapshot: u } = o,
										l = this.createViewTransition?.(
											this.environmentInjector,
											c.root,
											u.root
										)
									return l ? Z(l).pipe(k(() => o)) : C(o)
								}),
								k((c) => {
									let u = Dk(
										n.routeReuseStrategy,
										c.targetSnapshot,
										c.currentRouterState
									)
									return (
										(this.currentTransition = o =
											L(y({}, c), { targetRouterState: u })),
										(this.currentNavigation.targetRouterState = u),
										o
									)
								}),
								J(() => {
									this.events.next(new xo())
								}),
								Sk(
									this.rootContexts,
									n.routeReuseStrategy,
									(c) => this.events.next(c),
									this.inputBindingEnabled
								),
								Bt(1),
								J({
									next: (c) => {
										;(s = !0),
											(this.lastSuccessfulNavigation = this.currentNavigation),
											this.events.next(
												new Ot(
													c.id,
													this.urlSerializer.serialize(c.extractedUrl),
													this.urlSerializer.serialize(c.urlAfterRedirects)
												)
											),
											this.titleStrategy?.updateTitle(
												c.targetRouterState.snapshot
											),
											c.resolve(!0)
									},
									complete: () => {
										s = !0
									},
								}),
								El(
									this.transitionAbortSubject.pipe(
										J((c) => {
											throw c
										})
									)
								),
								pn(() => {
									!s &&
										!a &&
										this.cancelNavigationTransition(
											o,
											'',
											$e.SupersededByNewNavigation
										),
										this.currentTransition?.id === o.id &&
											((this.currentNavigation = null),
											(this.currentTransition = null))
								}),
								et((c) => {
									if (this.destroyed) return o.resolve(!1), Se
									if (((a = !0), ow(c)))
										this.events.next(
											new en(
												o.id,
												this.urlSerializer.serialize(o.extractedUrl),
												c.message,
												c.cancellationCode
											)
										),
											Tk(c)
												? this.events.next(
														new bi(c.url, c.navigationBehaviorOptions)
												  )
												: o.resolve(!1)
									else {
										let u = new ko(
											o.id,
											this.urlSerializer.serialize(o.extractedUrl),
											c,
											o.targetSnapshot ?? void 0
										)
										try {
											let l = he(this.environmentInjector, () =>
												this.navigationErrorHandler?.(u)
											)
											if (l instanceof Fo) {
												let { message: d, cancellationCode: h } = qc(
													this.urlSerializer,
													l
												)
												this.events.next(
													new en(
														o.id,
														this.urlSerializer.serialize(o.extractedUrl),
														d,
														h
													)
												),
													this.events.next(
														new bi(l.redirectTo, l.navigationBehaviorOptions)
													)
											} else throw (this.events.next(u), c)
										} catch (l) {
											this.options.resolveNavigationPromiseOnError
												? o.resolve(!1)
												: o.reject(l)
										}
									}
									return Se
								})
							)
						})
					)
				)
			}
			cancelNavigationTransition(n, r, i) {
				let o = new en(n.id, this.urlSerializer.serialize(n.extractedUrl), r, i)
				this.events.next(o), n.resolve(!1)
			}
			isUpdatingInternalState() {
				return (
					this.currentTransition?.extractedUrl.toString() !==
					this.currentTransition?.currentUrlTree.toString()
				)
			}
			isUpdatedBrowserUrl() {
				let n = this.urlHandlingStrategy.extract(
						this.urlSerializer.parse(this.location.path(!0))
					),
					r =
						this.currentNavigation?.targetBrowserUrl ??
						this.currentNavigation?.extractedUrl
				return (
					n.toString() !== r?.toString() &&
					!this.currentNavigation?.extras.skipLocationChange
				)
			}
			static ɵfac = function (r) {
				return new (r || e)()
			}
			static ɵprov = _({ token: e, factory: e.ɵfac, providedIn: 'root' })
		}
		return e
	})()
function _x(e) {
	return e !== Ro
}
var Ix = (() => {
		class e {
			static ɵfac = function (r) {
				return new (r || e)()
			}
			static ɵprov = _({ token: e, factory: () => g(wx), providedIn: 'root' })
		}
		return e
	})(),
	Zh = class {
		shouldDetach(t) {
			return !1
		}
		store(t, n) {}
		shouldAttach(t) {
			return !1
		}
		retrieve(t) {
			return null
		}
		shouldReuseRoute(t, n) {
			return t.routeConfig === n.routeConfig
		}
	},
	wx = (() => {
		class e extends Zh {
			static ɵfac = (() => {
				let n
				return function (i) {
					return (n || (n = ni(e)))(i || e)
				}
			})()
			static ɵprov = _({ token: e, factory: e.ɵfac, providedIn: 'root' })
		}
		return e
	})(),
	mw = (() => {
		class e {
			static ɵfac = function (r) {
				return new (r || e)()
			}
			static ɵprov = _({ token: e, factory: () => g(Dx), providedIn: 'root' })
		}
		return e
	})(),
	Dx = (() => {
		class e extends mw {
			location = g(pi)
			urlSerializer = g(Bo)
			options = g(Wo, { optional: !0 }) || {}
			canceledNavigationResolution =
				this.options.canceledNavigationResolution || 'replace'
			urlHandlingStrategy = g(tp)
			urlUpdateStrategy = this.options.urlUpdateStrategy || 'deferred'
			currentUrlTree = new tn()
			getCurrentUrlTree() {
				return this.currentUrlTree
			}
			rawUrlTree = this.currentUrlTree
			getRawUrlTree() {
				return this.rawUrlTree
			}
			currentPageId = 0
			lastSuccessfulId = -1
			restoredState() {
				return this.location.getState()
			}
			get browserPageId() {
				return this.canceledNavigationResolution !== 'computed'
					? this.currentPageId
					: this.restoredState()?.ɵrouterPageId ?? this.currentPageId
			}
			routerState = ew(null)
			getRouterState() {
				return this.routerState
			}
			stateMemento = this.createStateMemento()
			createStateMemento() {
				return {
					rawUrlTree: this.rawUrlTree,
					currentUrlTree: this.currentUrlTree,
					routerState: this.routerState,
				}
			}
			registerNonRouterCurrentEntryChangeListener(n) {
				return this.location.subscribe((r) => {
					r.type === 'popstate' && n(r.url, r.state)
				})
			}
			handleRouterEvent(n, r) {
				if (n instanceof Di) this.stateMemento = this.createStateMemento()
				else if (n instanceof kn) this.rawUrlTree = r.initialUrl
				else if (n instanceof Bc) {
					if (
						this.urlUpdateStrategy === 'eager' &&
						!r.extras.skipLocationChange
					) {
						let i = this.urlHandlingStrategy.merge(r.finalUrl, r.initialUrl)
						this.setBrowserUrl(r.targetBrowserUrl ?? i, r)
					}
				} else
					n instanceof xo
						? ((this.currentUrlTree = r.finalUrl),
						  (this.rawUrlTree = this.urlHandlingStrategy.merge(
								r.finalUrl,
								r.initialUrl
						  )),
						  (this.routerState = r.targetRouterState),
						  this.urlUpdateStrategy === 'deferred' &&
								!r.extras.skipLocationChange &&
								this.setBrowserUrl(r.targetBrowserUrl ?? this.rawUrlTree, r))
						: n instanceof en &&
						  (n.code === $e.GuardRejected || n.code === $e.NoDataFromResolver)
						? this.restoreHistory(r)
						: n instanceof ko
						? this.restoreHistory(r, !0)
						: n instanceof Ot &&
						  ((this.lastSuccessfulId = n.id),
						  (this.currentPageId = this.browserPageId))
			}
			setBrowserUrl(n, r) {
				let i = n instanceof tn ? this.urlSerializer.serialize(n) : n
				if (this.location.isCurrentPathEqualTo(i) || r.extras.replaceUrl) {
					let o = this.browserPageId,
						s = y(y({}, r.extras.state), this.generateNgRouterState(r.id, o))
					this.location.replaceState(i, '', s)
				} else {
					let o = y(
						y({}, r.extras.state),
						this.generateNgRouterState(r.id, this.browserPageId + 1)
					)
					this.location.go(i, '', o)
				}
			}
			restoreHistory(n, r = !1) {
				if (this.canceledNavigationResolution === 'computed') {
					let i = this.browserPageId,
						o = this.currentPageId - i
					o !== 0
						? this.location.historyGo(o)
						: this.currentUrlTree === n.finalUrl &&
						  o === 0 &&
						  (this.resetState(n), this.resetUrlToCurrentUrlTree())
				} else
					this.canceledNavigationResolution === 'replace' &&
						(r && this.resetState(n), this.resetUrlToCurrentUrlTree())
			}
			resetState(n) {
				;(this.routerState = this.stateMemento.routerState),
					(this.currentUrlTree = this.stateMemento.currentUrlTree),
					(this.rawUrlTree = this.urlHandlingStrategy.merge(
						this.currentUrlTree,
						n.finalUrl ?? this.rawUrlTree
					))
			}
			resetUrlToCurrentUrlTree() {
				this.location.replaceState(
					this.urlSerializer.serialize(this.rawUrlTree),
					'',
					this.generateNgRouterState(this.lastSuccessfulId, this.currentPageId)
				)
			}
			generateNgRouterState(n, r) {
				return this.canceledNavigationResolution === 'computed'
					? { navigationId: n, ɵrouterPageId: r }
					: { navigationId: n }
			}
			static ɵfac = (() => {
				let n
				return function (i) {
					return (n || (n = ni(e)))(i || e)
				}
			})()
			static ɵprov = _({ token: e, factory: e.ɵfac, providedIn: 'root' })
		}
		return e
	})()
function vw(e, t) {
	e.events
		.pipe(
			Me(
				(n) =>
					n instanceof Ot ||
					n instanceof en ||
					n instanceof ko ||
					n instanceof kn
			),
			k((n) =>
				n instanceof Ot || n instanceof kn
					? 0
					: (
							n instanceof en
								? n.code === $e.Redirect ||
								  n.code === $e.SupersededByNewNavigation
								: !1
					  )
					? 2
					: 1
			),
			Me((n) => n !== 2),
			Bt(1)
		)
		.subscribe(() => {
			t()
		})
}
var bx = {
		paths: 'exact',
		fragment: 'ignored',
		matrixParams: 'ignored',
		queryParams: 'exact',
	},
	Cx = {
		paths: 'subset',
		fragment: 'ignored',
		matrixParams: 'ignored',
		queryParams: 'subset',
	},
	Ie = (() => {
		class e {
			get currentUrlTree() {
				return this.stateManager.getCurrentUrlTree()
			}
			get rawUrlTree() {
				return this.stateManager.getRawUrlTree()
			}
			disposed = !1
			nonRouterCurrentEntryChangeSubscription
			console = g(kf)
			stateManager = g(mw)
			options = g(Wo, { optional: !0 }) || {}
			pendingTasks = g(Ke)
			urlUpdateStrategy = this.options.urlUpdateStrategy || 'deferred'
			navigationTransitions = g(np)
			urlSerializer = g(Bo)
			location = g(pi)
			urlHandlingStrategy = g(tp)
			_events = new ie()
			get events() {
				return this._events
			}
			get routerState() {
				return this.stateManager.getRouterState()
			}
			navigated = !1
			routeReuseStrategy = g(Ix)
			onSameUrlNavigation = this.options.onSameUrlNavigation || 'ignore'
			config = g(jo, { optional: !0 })?.flat() ?? []
			componentInputBindingEnabled = !!g(Zc, { optional: !0 })
			constructor() {
				this.resetConfig(this.config),
					this.navigationTransitions
						.setupNavigations(this, this.currentUrlTree, this.routerState)
						.subscribe({
							error: (n) => {
								this.console.warn(n)
							},
						}),
					this.subscribeToNavigationEvents()
			}
			eventsSubscription = new X()
			subscribeToNavigationEvents() {
				let n = this.navigationTransitions.events.subscribe((r) => {
					try {
						let i = this.navigationTransitions.currentTransition,
							o = this.navigationTransitions.currentNavigation
						if (i !== null && o !== null) {
							if (
								(this.stateManager.handleRouterEvent(r, o),
								r instanceof en &&
									r.code !== $e.Redirect &&
									r.code !== $e.SupersededByNewNavigation)
							)
								this.navigated = !0
							else if (r instanceof Ot) this.navigated = !0
							else if (r instanceof bi) {
								let s = r.navigationBehaviorOptions,
									a = this.urlHandlingStrategy.merge(r.url, i.currentRawUrl),
									c = y(
										{
											browserUrl: i.extras.browserUrl,
											info: i.extras.info,
											skipLocationChange: i.extras.skipLocationChange,
											replaceUrl:
												i.extras.replaceUrl ||
												this.urlUpdateStrategy === 'eager' ||
												_x(i.source),
										},
										s
									)
								this.scheduleNavigation(a, Ro, null, c, {
									resolve: i.resolve,
									reject: i.reject,
									promise: i.promise,
								})
							}
						}
						Sx(r) && this._events.next(r)
					} catch (i) {
						this.navigationTransitions.transitionAbortSubject.next(i)
					}
				})
				this.eventsSubscription.add(n)
			}
			resetRootComponentType(n) {
				;(this.routerState.root.component = n),
					(this.navigationTransitions.rootComponentType = n)
			}
			initialNavigation() {
				this.setUpLocationChangeListener(),
					this.navigationTransitions.hasRequestedNavigation ||
						this.navigateToSyncWithBrowser(
							this.location.path(!0),
							Ro,
							this.stateManager.restoredState()
						)
			}
			setUpLocationChangeListener() {
				this.nonRouterCurrentEntryChangeSubscription ??=
					this.stateManager.registerNonRouterCurrentEntryChangeListener(
						(n, r) => {
							setTimeout(() => {
								this.navigateToSyncWithBrowser(n, 'popstate', r)
							}, 0)
						}
					)
			}
			navigateToSyncWithBrowser(n, r, i) {
				let o = { replaceUrl: !0 },
					s = i?.navigationId ? i : null
				if (i) {
					let c = y({}, i)
					delete c.navigationId,
						delete c.ɵrouterPageId,
						Object.keys(c).length !== 0 && (o.state = c)
				}
				let a = this.parseUrl(n)
				this.scheduleNavigation(a, r, s, o)
			}
			get url() {
				return this.serializeUrl(this.currentUrlTree)
			}
			getCurrentNavigation() {
				return this.navigationTransitions.currentNavigation
			}
			get lastSuccessfulNavigation() {
				return this.navigationTransitions.lastSuccessfulNavigation
			}
			resetConfig(n) {
				;(this.config = n.map(Xh)), (this.navigated = !1)
			}
			ngOnDestroy() {
				this.dispose()
			}
			dispose() {
				this._events.unsubscribe(),
					this.navigationTransitions.complete(),
					this.nonRouterCurrentEntryChangeSubscription &&
						(this.nonRouterCurrentEntryChangeSubscription.unsubscribe(),
						(this.nonRouterCurrentEntryChangeSubscription = void 0)),
					(this.disposed = !0),
					this.eventsSubscription.unsubscribe()
			}
			createUrlTree(n, r = {}) {
				let {
						relativeTo: i,
						queryParams: o,
						fragment: s,
						queryParamsHandling: a,
						preserveFragment: c,
					} = r,
					u = c ? this.currentUrlTree.fragment : s,
					l = null
				switch (a ?? this.options.defaultQueryParamsHandling) {
					case 'merge':
						l = y(y({}, this.currentUrlTree.queryParams), o)
						break
					case 'preserve':
						l = this.currentUrlTree.queryParams
						break
					default:
						l = o || null
				}
				l !== null && (l = this.removeEmptyProps(l))
				let d
				try {
					let h = i ? i.snapshot : this.routerState.snapshot.root
					d = ZI(h)
				} catch {
					;(typeof n[0] != 'string' || n[0][0] !== '/') && (n = []),
						(d = this.currentUrlTree.root)
				}
				return QI(d, n, l, u ?? null)
			}
			navigateByUrl(n, r = { skipLocationChange: !1 }) {
				let i = fr(n) ? n : this.parseUrl(n),
					o = this.urlHandlingStrategy.merge(i, this.rawUrlTree)
				return this.scheduleNavigation(o, Ro, null, r)
			}
			navigate(n, r = { skipLocationChange: !1 }) {
				return Tx(n), this.navigateByUrl(this.createUrlTree(n, r), r)
			}
			serializeUrl(n) {
				return this.urlSerializer.serialize(n)
			}
			parseUrl(n) {
				try {
					return this.urlSerializer.parse(n)
				} catch {
					return this.urlSerializer.parse('/')
				}
			}
			isActive(n, r) {
				let i
				if (
					(r === !0 ? (i = y({}, bx)) : r === !1 ? (i = y({}, Cx)) : (i = r),
					fr(n))
				)
					return NI(this.currentUrlTree, n, i)
				let o = this.parseUrl(n)
				return NI(this.currentUrlTree, o, i)
			}
			removeEmptyProps(n) {
				return Object.entries(n).reduce(
					(r, [i, o]) => (o != null && (r[i] = o), r),
					{}
				)
			}
			scheduleNavigation(n, r, i, o, s) {
				if (this.disposed) return Promise.resolve(!1)
				let a, c, u
				s
					? ((a = s.resolve), (c = s.reject), (u = s.promise))
					: (u = new Promise((d, h) => {
							;(a = d), (c = h)
					  }))
				let l = this.pendingTasks.add()
				return (
					vw(this, () => {
						queueMicrotask(() => this.pendingTasks.remove(l))
					}),
					this.navigationTransitions.handleNavigationRequest({
						source: r,
						restoredState: i,
						currentUrlTree: this.currentUrlTree,
						currentRawUrl: this.currentUrlTree,
						rawUrl: n,
						extras: o,
						resolve: a,
						reject: c,
						promise: u,
						currentSnapshot: this.routerState.snapshot,
						currentRouterState: this.routerState,
					}),
					u.catch((d) => Promise.reject(d))
				)
			}
			static ɵfac = function (r) {
				return new (r || e)()
			}
			static ɵprov = _({ token: e, factory: e.ɵfac, providedIn: 'root' })
		}
		return e
	})()
function Tx(e) {
	for (let t = 0; t < e.length; t++) if (e[t] == null) throw new w(4008, !1)
}
function Sx(e) {
	return !(e instanceof xo) && !(e instanceof bi)
}
var yw = (() => {
	class e {
		router
		route
		tabIndexAttribute
		renderer
		el
		locationStrategy
		href = null
		target
		queryParams
		fragment
		queryParamsHandling
		state
		info
		relativeTo
		isAnchorElement
		subscription
		onChanges = new ie()
		constructor(n, r, i, o, s, a) {
			;(this.router = n),
				(this.route = r),
				(this.tabIndexAttribute = i),
				(this.renderer = o),
				(this.el = s),
				(this.locationStrategy = a)
			let c = s.nativeElement.tagName?.toLowerCase()
			;(this.isAnchorElement = c === 'a' || c === 'area'),
				this.isAnchorElement
					? (this.subscription = n.events.subscribe((u) => {
							u instanceof Ot && this.updateHref()
					  }))
					: this.setTabIndexIfNotOnNativeEl('0')
		}
		preserveFragment = !1
		skipLocationChange = !1
		replaceUrl = !1
		setTabIndexIfNotOnNativeEl(n) {
			this.tabIndexAttribute != null ||
				this.isAnchorElement ||
				this.applyAttributeValue('tabindex', n)
		}
		ngOnChanges(n) {
			this.isAnchorElement && this.updateHref(), this.onChanges.next(this)
		}
		routerLinkInput = null
		set routerLink(n) {
			n == null
				? ((this.routerLinkInput = null), this.setTabIndexIfNotOnNativeEl(null))
				: (fr(n)
						? (this.routerLinkInput = n)
						: (this.routerLinkInput = Array.isArray(n) ? n : [n]),
				  this.setTabIndexIfNotOnNativeEl('0'))
		}
		onClick(n, r, i, o, s) {
			let a = this.urlTree
			if (
				a === null ||
				(this.isAnchorElement &&
					(n !== 0 ||
						r ||
						i ||
						o ||
						s ||
						(typeof this.target == 'string' && this.target != '_self')))
			)
				return !0
			let c = {
				skipLocationChange: this.skipLocationChange,
				replaceUrl: this.replaceUrl,
				state: this.state,
				info: this.info,
			}
			return this.router.navigateByUrl(a, c), !this.isAnchorElement
		}
		ngOnDestroy() {
			this.subscription?.unsubscribe()
		}
		updateHref() {
			let n = this.urlTree
			this.href =
				n !== null && this.locationStrategy
					? this.locationStrategy?.prepareExternalUrl(
							this.router.serializeUrl(n)
					  )
					: null
			let r =
				this.href === null
					? null
					: mE(this.href, this.el.nativeElement.tagName.toLowerCase(), 'href')
			this.applyAttributeValue('href', r)
		}
		applyAttributeValue(n, r) {
			let i = this.renderer,
				o = this.el.nativeElement
			r !== null ? i.setAttribute(o, n, r) : i.removeAttribute(o, n)
		}
		get urlTree() {
			return this.routerLinkInput === null
				? null
				: fr(this.routerLinkInput)
				? this.routerLinkInput
				: this.router.createUrlTree(this.routerLinkInput, {
						relativeTo:
							this.relativeTo !== void 0 ? this.relativeTo : this.route,
						queryParams: this.queryParams,
						fragment: this.fragment,
						queryParamsHandling: this.queryParamsHandling,
						preserveFragment: this.preserveFragment,
				  })
		}
		static ɵfac = function (r) {
			return new (r || e)(M(Ie), M(kt), rf('tabindex'), M(Dn), M(Ye), M(Xt))
		}
		static ɵdir = Ce({
			type: e,
			selectors: [['', 'routerLink', '']],
			hostVars: 1,
			hostBindings: function (r, i) {
				r & 1 &&
					Ue('click', function (s) {
						return i.onClick(
							s.button,
							s.ctrlKey,
							s.shiftKey,
							s.altKey,
							s.metaKey
						)
					}),
					r & 2 && po('target', i.target)
			},
			inputs: {
				target: 'target',
				queryParams: 'queryParams',
				fragment: 'fragment',
				queryParamsHandling: 'queryParamsHandling',
				state: 'state',
				info: 'info',
				relativeTo: 'relativeTo',
				preserveFragment: [2, 'preserveFragment', 'preserveFragment', An],
				skipLocationChange: [2, 'skipLocationChange', 'skipLocationChange', An],
				replaceUrl: [2, 'replaceUrl', 'replaceUrl', An],
				routerLink: 'routerLink',
			},
			features: [or],
		})
	}
	return e
})()
var Yc = class {}
var Ax = (() => {
		class e {
			router
			injector
			preloadingStrategy
			loader
			subscription
			constructor(n, r, i, o, s) {
				;(this.router = n),
					(this.injector = i),
					(this.preloadingStrategy = o),
					(this.loader = s)
			}
			setUpPreloading() {
				this.subscription = this.router.events
					.pipe(
						Me((n) => n instanceof Ot),
						Ut(() => this.preload())
					)
					.subscribe(() => {})
			}
			preload() {
				return this.processRoutes(this.injector, this.router.config)
			}
			ngOnDestroy() {
				this.subscription && this.subscription.unsubscribe()
			}
			processRoutes(n, r) {
				let i = []
				for (let o of r) {
					o.providers &&
						!o._injector &&
						(o._injector = fo(o.providers, n, `Route: ${o.path}`))
					let s = o._injector ?? n,
						a = o._loadedInjector ?? s
					;((o.loadChildren && !o._loadedRoutes && o.canLoad === void 0) ||
						(o.loadComponent && !o._loadedComponent)) &&
						i.push(this.preloadConfig(s, o)),
						(o.children || o._loadedRoutes) &&
							i.push(this.processRoutes(a, o.children ?? o._loadedRoutes))
				}
				return Z(i).pipe(Nr())
			}
			preloadConfig(n, r) {
				return this.preloadingStrategy.preload(r, () => {
					let i
					r.loadChildren && r.canLoad === void 0
						? (i = this.loader.loadChildren(n, r))
						: (i = C(null))
					let o = i.pipe(
						se((s) =>
							s === null
								? C(void 0)
								: ((r._loadedRoutes = s.routes),
								  (r._loadedInjector = s.injector),
								  this.processRoutes(s.injector ?? n, s.routes))
						)
					)
					if (r.loadComponent && !r._loadedComponent) {
						let s = this.loader.loadComponent(r)
						return Z([o, s]).pipe(Nr())
					} else return o
				})
			}
			static ɵfac = function (r) {
				return new (r || e)(I(Ie), I(wc), I(fe), I(Yc), I(ep))
			}
			static ɵprov = _({ token: e, factory: e.ɵfac, providedIn: 'root' })
		}
		return e
	})(),
	Ew = new E(''),
	Mx = (() => {
		class e {
			urlSerializer
			transitions
			viewportScroller
			zone
			options
			routerEventsSubscription
			scrollEventsSubscription
			lastId = 0
			lastSource = 'imperative'
			restoredId = 0
			store = {}
			constructor(n, r, i, o, s = {}) {
				;(this.urlSerializer = n),
					(this.transitions = r),
					(this.viewportScroller = i),
					(this.zone = o),
					(this.options = s),
					(s.scrollPositionRestoration ||= 'disabled'),
					(s.anchorScrolling ||= 'disabled')
			}
			init() {
				this.options.scrollPositionRestoration !== 'disabled' &&
					this.viewportScroller.setHistoryScrollRestoration('manual'),
					(this.routerEventsSubscription = this.createScrollEvents()),
					(this.scrollEventsSubscription = this.consumeScrollEvents())
			}
			createScrollEvents() {
				return this.transitions.events.subscribe((n) => {
					n instanceof Di
						? ((this.store[this.lastId] =
								this.viewportScroller.getScrollPosition()),
						  (this.lastSource = n.navigationTrigger),
						  (this.restoredId = n.restoredState
								? n.restoredState.navigationId
								: 0))
						: n instanceof Ot
						? ((this.lastId = n.id),
						  this.scheduleScrollEvent(
								n,
								this.urlSerializer.parse(n.urlAfterRedirects).fragment
						  ))
						: n instanceof kn &&
						  n.code === Uc.IgnoredSameUrlNavigation &&
						  ((this.lastSource = void 0),
						  (this.restoredId = 0),
						  this.scheduleScrollEvent(
								n,
								this.urlSerializer.parse(n.url).fragment
						  ))
				})
			}
			consumeScrollEvents() {
				return this.transitions.events.subscribe((n) => {
					n instanceof $c &&
						(n.position
							? this.options.scrollPositionRestoration === 'top'
								? this.viewportScroller.scrollToPosition([0, 0])
								: this.options.scrollPositionRestoration === 'enabled' &&
								  this.viewportScroller.scrollToPosition(n.position)
							: n.anchor && this.options.anchorScrolling === 'enabled'
							? this.viewportScroller.scrollToAnchor(n.anchor)
							: this.options.scrollPositionRestoration !== 'disabled' &&
							  this.viewportScroller.scrollToPosition([0, 0]))
				})
			}
			scheduleScrollEvent(n, r) {
				this.zone.runOutsideAngular(() => {
					setTimeout(() => {
						this.zone.run(() => {
							this.transitions.events.next(
								new $c(
									n,
									this.lastSource === 'popstate'
										? this.store[this.restoredId]
										: null,
									r
								)
							)
						})
					}, 0)
				})
			}
			ngOnDestroy() {
				this.routerEventsSubscription?.unsubscribe(),
					this.scrollEventsSubscription?.unsubscribe()
			}
			static ɵfac = function (r) {
				ZE()
			}
			static ɵprov = _({ token: e, factory: e.ɵfac })
		}
		return e
	})()
function _w(e, ...t) {
	return qe([
		{ provide: jo, multi: !0, useValue: e },
		[],
		{ provide: kt, useFactory: Iw, deps: [Ie] },
		{ provide: Tn, multi: !0, useFactory: ww },
		t.map((n) => n.ɵproviders),
	])
}
function Iw(e) {
	return e.routerState.root
}
function Go(e, t) {
	return { ɵkind: e, ɵproviders: t }
}
function ww() {
	let e = g(ae)
	return (t) => {
		let n = e.get(ve)
		if (t !== n.components[0]) return
		let r = e.get(Ie),
			i = e.get(Dw)
		e.get(rp) === 1 && r.initialNavigation(),
			e.get(bw, null, F.Optional)?.setUpPreloading(),
			e.get(Ew, null, F.Optional)?.init(),
			r.resetRootComponentType(n.componentTypes[0]),
			i.closed || (i.next(), i.complete(), i.unsubscribe())
	}
}
var Dw = new E('', { factory: () => new ie() }),
	rp = new E('', { providedIn: 'root', factory: () => 1 })
function Rx() {
	return Go(2, [
		{ provide: rp, useValue: 0 },
		{
			provide: vc,
			multi: !0,
			deps: [ae],
			useFactory: (t) => {
				let n = t.get(j_, Promise.resolve())
				return () =>
					n.then(
						() =>
							new Promise((r) => {
								let i = t.get(Ie),
									o = t.get(Dw)
								vw(i, () => {
									r(!0)
								}),
									(t.get(np).afterPreactivation = () => (
										r(!0), o.closed ? C(void 0) : o
									)),
									i.initialNavigation()
							})
					)
			},
		},
	])
}
function Nx() {
	return Go(3, [
		{
			provide: vc,
			multi: !0,
			useFactory: () => {
				let t = g(Ie)
				return () => {
					t.setUpLocationChangeListener()
				}
			},
		},
		{ provide: rp, useValue: 2 },
	])
}
var bw = new E('')
function Ox(e) {
	return Go(0, [
		{ provide: bw, useExisting: Ax },
		{ provide: Yc, useExisting: e },
	])
}
function kx() {
	return Go(8, [PI, { provide: Zc, useExisting: PI }])
}
function xx(e) {
	let t = [
		{ provide: hw, useValue: yx },
		{
			provide: pw,
			useValue: y({ skipNextTransition: !!e?.skipInitialTransition }, e),
		},
	]
	return Go(9, t)
}
var Px = [
		pi,
		{ provide: Bo, useClass: wi },
		Ie,
		Ho,
		{ provide: kt, useFactory: Iw, deps: [Ie] },
		ep,
		[],
	],
	Cw = (() => {
		class e {
			constructor() {}
			static forRoot(n, r) {
				return {
					ngModule: e,
					providers: [
						Px,
						[],
						{ provide: jo, multi: !0, useValue: n },
						[],
						r?.errorHandler ? { provide: gw, useValue: r.errorHandler } : [],
						{ provide: Wo, useValue: r || {} },
						r?.useHash ? Lx() : Vx(),
						Fx(),
						r?.preloadingStrategy ? Ox(r.preloadingStrategy).ɵproviders : [],
						r?.initialNavigation ? jx(r) : [],
						r?.bindToComponentInputs ? kx().ɵproviders : [],
						r?.enableViewTransitions ? xx().ɵproviders : [],
						Ux(),
					],
				}
			}
			static forChild(n) {
				return {
					ngModule: e,
					providers: [{ provide: jo, multi: !0, useValue: n }],
				}
			}
			static ɵfac = function (r) {
				return new (r || e)()
			}
			static ɵmod = ct({ type: e })
			static ɵinj = ot({})
		}
		return e
	})()
function Fx() {
	return {
		provide: Ew,
		useFactory: () => {
			let e = g(W_),
				t = g(j),
				n = g(Wo),
				r = g(np),
				i = g(Bo)
			return (
				n.scrollOffset && e.setOffset(n.scrollOffset), new Mx(i, r, e, t, n)
			)
		},
	}
}
function Lx() {
	return { provide: Xt, useClass: B_ }
}
function Vx() {
	return { provide: Xt, useClass: Xf }
}
function jx(e) {
	return [
		e.initialNavigation === 'disabled' ? Nx().ɵproviders : [],
		e.initialNavigation === 'enabledBlocking' ? Rx().ɵproviders : [],
	]
}
var jI = new E('')
function Ux() {
	return [
		{ provide: jI, useFactory: ww },
		{ provide: Tn, multi: !0, useExisting: jI },
	]
}
var xw = (() => {
		class e {
			_renderer
			_elementRef
			onChange = (n) => {}
			onTouched = () => {}
			constructor(n, r) {
				;(this._renderer = n), (this._elementRef = r)
			}
			setProperty(n, r) {
				this._renderer.setProperty(this._elementRef.nativeElement, n, r)
			}
			registerOnTouched(n) {
				this.onTouched = n
			}
			registerOnChange(n) {
				this.onChange = n
			}
			setDisabledState(n) {
				this.setProperty('disabled', n)
			}
			static ɵfac = function (r) {
				return new (r || e)(M(Dn), M(Ye))
			}
			static ɵdir = Ce({ type: e })
		}
		return e
	})(),
	Bx = (() => {
		class e extends xw {
			static ɵfac = (() => {
				let n
				return function (i) {
					return (n || (n = ni(e)))(i || e)
				}
			})()
			static ɵdir = Ce({ type: e, features: [cr] })
		}
		return e
	})(),
	Pw = new E('')
var $x = { provide: Pw, useExisting: Zr(() => Ri), multi: !0 }
function Hx() {
	let e = At() ? At().getUserAgent() : ''
	return /android (\d+)/.test(e.toLowerCase())
}
var zx = new E(''),
	Ri = (() => {
		class e extends xw {
			_compositionMode
			_composing = !1
			constructor(n, r, i) {
				super(n, r),
					(this._compositionMode = i),
					this._compositionMode == null && (this._compositionMode = !Hx())
			}
			writeValue(n) {
				let r = n ?? ''
				this.setProperty('value', r)
			}
			_handleInput(n) {
				;(!this._compositionMode ||
					(this._compositionMode && !this._composing)) &&
					this.onChange(n)
			}
			_compositionStart() {
				this._composing = !0
			}
			_compositionEnd(n) {
				;(this._composing = !1), this._compositionMode && this.onChange(n)
			}
			static ɵfac = function (r) {
				return new (r || e)(M(Dn), M(Ye), M(zx, 8))
			}
			static ɵdir = Ce({
				type: e,
				selectors: [
					['input', 'formControlName', '', 3, 'type', 'checkbox'],
					['textarea', 'formControlName', ''],
					['input', 'formControl', '', 3, 'type', 'checkbox'],
					['textarea', 'formControl', ''],
					['input', 'ngModel', '', 3, 'type', 'checkbox'],
					['textarea', 'ngModel', ''],
					['', 'ngDefaultControl', ''],
				],
				hostBindings: function (r, i) {
					r & 1 &&
						Ue('input', function (s) {
							return i._handleInput(s.target.value)
						})('blur', function () {
							return i.onTouched()
						})('compositionstart', function () {
							return i._compositionStart()
						})('compositionend', function (s) {
							return i._compositionEnd(s.target.value)
						})
				},
				standalone: !1,
				features: [Ic([$x]), cr],
			})
		}
		return e
	})()
function Wx(e) {
	return e == null || Gx(e) === 0
}
function Gx(e) {
	return e == null
		? null
		: Array.isArray(e) || typeof e == 'string'
		? e.length
		: e instanceof Set
		? e.size
		: null
}
var Fw = new E(''),
	qx = new E('')
function Kx(e) {
	return Wx(e.value) ? { required: !0 } : null
}
function Tw(e) {
	return null
}
function Lw(e) {
	return e != null
}
function Vw(e) {
	return Cn(e) ? Z(e) : e
}
function jw(e) {
	let t = {}
	return (
		e.forEach((n) => {
			t = n != null ? y(y({}, t), n) : t
		}),
		Object.keys(t).length === 0 ? null : t
	)
}
function Uw(e, t) {
	return t.map((n) => n(e))
}
function Yx(e) {
	return !e.validate
}
function Bw(e) {
	return e.map((t) => (Yx(t) ? t : (n) => t.validate(n)))
}
function Zx(e) {
	if (!e) return null
	let t = e.filter(Lw)
	return t.length == 0
		? null
		: function (n) {
				return jw(Uw(n, t))
		  }
}
function $w(e) {
	return e != null ? Zx(Bw(e)) : null
}
function Qx(e) {
	if (!e) return null
	let t = e.filter(Lw)
	return t.length == 0
		? null
		: function (n) {
				let r = Uw(n, t).map(Vw)
				return gl(r).pipe(k(jw))
		  }
}
function Hw(e) {
	return e != null ? Qx(Bw(e)) : null
}
function Sw(e, t) {
	return e === null ? [t] : Array.isArray(e) ? [...e, t] : [e, t]
}
function Jx(e) {
	return e._rawValidators
}
function Xx(e) {
	return e._rawAsyncValidators
}
function ip(e) {
	return e ? (Array.isArray(e) ? e : [e]) : []
}
function eu(e, t) {
	return Array.isArray(e) ? e.includes(t) : e === t
}
function Aw(e, t) {
	let n = ip(t)
	return (
		ip(e).forEach((i) => {
			eu(n, i) || n.push(i)
		}),
		n
	)
}
function Mw(e, t) {
	return ip(t).filter((n) => !eu(e, n))
}
var tu = class {
		get value() {
			return this.control ? this.control.value : null
		}
		get valid() {
			return this.control ? this.control.valid : null
		}
		get invalid() {
			return this.control ? this.control.invalid : null
		}
		get pending() {
			return this.control ? this.control.pending : null
		}
		get disabled() {
			return this.control ? this.control.disabled : null
		}
		get enabled() {
			return this.control ? this.control.enabled : null
		}
		get errors() {
			return this.control ? this.control.errors : null
		}
		get pristine() {
			return this.control ? this.control.pristine : null
		}
		get dirty() {
			return this.control ? this.control.dirty : null
		}
		get touched() {
			return this.control ? this.control.touched : null
		}
		get status() {
			return this.control ? this.control.status : null
		}
		get untouched() {
			return this.control ? this.control.untouched : null
		}
		get statusChanges() {
			return this.control ? this.control.statusChanges : null
		}
		get valueChanges() {
			return this.control ? this.control.valueChanges : null
		}
		get path() {
			return null
		}
		_composedValidatorFn
		_composedAsyncValidatorFn
		_rawValidators = []
		_rawAsyncValidators = []
		_setValidators(t) {
			;(this._rawValidators = t || []),
				(this._composedValidatorFn = $w(this._rawValidators))
		}
		_setAsyncValidators(t) {
			;(this._rawAsyncValidators = t || []),
				(this._composedAsyncValidatorFn = Hw(this._rawAsyncValidators))
		}
		get validator() {
			return this._composedValidatorFn || null
		}
		get asyncValidator() {
			return this._composedAsyncValidatorFn || null
		}
		_onDestroyCallbacks = []
		_registerOnDestroy(t) {
			this._onDestroyCallbacks.push(t)
		}
		_invokeOnDestroyCallbacks() {
			this._onDestroyCallbacks.forEach((t) => t()),
				(this._onDestroyCallbacks = [])
		}
		reset(t = void 0) {
			this.control && this.control.reset(t)
		}
		hasError(t, n) {
			return this.control ? this.control.hasError(t, n) : !1
		}
		getError(t, n) {
			return this.control ? this.control.getError(t, n) : null
		}
	},
	op = class extends tu {
		name
		get formDirective() {
			return null
		}
		get path() {
			return null
		}
	},
	Qo = class extends tu {
		_parent = null
		name = null
		valueAccessor = null
	},
	sp = class {
		_cd
		constructor(t) {
			this._cd = t
		}
		get isTouched() {
			return this._cd?.control?._touched?.(), !!this._cd?.control?.touched
		}
		get isUntouched() {
			return !!this._cd?.control?.untouched
		}
		get isPristine() {
			return this._cd?.control?._pristine?.(), !!this._cd?.control?.pristine
		}
		get isDirty() {
			return !!this._cd?.control?.dirty
		}
		get isValid() {
			return this._cd?.control?._status?.(), !!this._cd?.control?.valid
		}
		get isInvalid() {
			return !!this._cd?.control?.invalid
		}
		get isPending() {
			return !!this._cd?.control?.pending
		}
		get isSubmitted() {
			return this._cd?._submitted?.(), !!this._cd?.submitted
		}
	},
	eP = {
		'[class.ng-untouched]': 'isUntouched',
		'[class.ng-touched]': 'isTouched',
		'[class.ng-pristine]': 'isPristine',
		'[class.ng-dirty]': 'isDirty',
		'[class.ng-valid]': 'isValid',
		'[class.ng-invalid]': 'isInvalid',
		'[class.ng-pending]': 'isPending',
	},
	D3 = L(y({}, eP), { '[class.ng-submitted]': 'isSubmitted' }),
	ru = (() => {
		class e extends sp {
			constructor(n) {
				super(n)
			}
			static ɵfac = function (r) {
				return new (r || e)(M(Qo, 2))
			}
			static ɵdir = Ce({
				type: e,
				selectors: [
					['', 'formControlName', ''],
					['', 'ngModel', ''],
					['', 'formControl', ''],
				],
				hostVars: 14,
				hostBindings: function (r, i) {
					r & 2 &&
						Lf('ng-untouched', i.isUntouched)('ng-touched', i.isTouched)(
							'ng-pristine',
							i.isPristine
						)('ng-dirty', i.isDirty)('ng-valid', i.isValid)(
							'ng-invalid',
							i.isInvalid
						)('ng-pending', i.isPending)
				},
				standalone: !1,
				features: [cr],
			})
		}
		return e
	})()
var qo = 'VALID',
	Xc = 'INVALID',
	Si = 'PENDING',
	Ko = 'DISABLED',
	Mi = class {},
	nu = class extends Mi {
		value
		source
		constructor(t, n) {
			super(), (this.value = t), (this.source = n)
		}
	},
	Yo = class extends Mi {
		pristine
		source
		constructor(t, n) {
			super(), (this.pristine = t), (this.source = n)
		}
	},
	Zo = class extends Mi {
		touched
		source
		constructor(t, n) {
			super(), (this.touched = t), (this.source = n)
		}
	},
	Ai = class extends Mi {
		status
		source
		constructor(t, n) {
			super(), (this.status = t), (this.source = n)
		}
	}
function tP(e) {
	return (iu(e) ? e.validators : e) || null
}
function nP(e) {
	return Array.isArray(e) ? $w(e) : e || null
}
function rP(e, t) {
	return (iu(t) ? t.asyncValidators : e) || null
}
function iP(e) {
	return Array.isArray(e) ? Hw(e) : e || null
}
function iu(e) {
	return e != null && !Array.isArray(e) && typeof e == 'object'
}
var ap = class {
	_pendingDirty = !1
	_hasOwnPendingAsyncValidator = null
	_pendingTouched = !1
	_onCollectionChange = () => {}
	_updateOn
	_parent = null
	_asyncValidationSubscription
	_composedValidatorFn
	_composedAsyncValidatorFn
	_rawValidators
	_rawAsyncValidators
	value
	constructor(t, n) {
		this._assignValidators(t), this._assignAsyncValidators(n)
	}
	get validator() {
		return this._composedValidatorFn
	}
	set validator(t) {
		this._rawValidators = this._composedValidatorFn = t
	}
	get asyncValidator() {
		return this._composedAsyncValidatorFn
	}
	set asyncValidator(t) {
		this._rawAsyncValidators = this._composedAsyncValidatorFn = t
	}
	get parent() {
		return this._parent
	}
	get status() {
		return ut(this.statusReactive)
	}
	set status(t) {
		ut(() => this.statusReactive.set(t))
	}
	_status = fi(() => this.statusReactive())
	statusReactive = oi(void 0)
	get valid() {
		return this.status === qo
	}
	get invalid() {
		return this.status === Xc
	}
	get pending() {
		return this.status == Si
	}
	get disabled() {
		return this.status === Ko
	}
	get enabled() {
		return this.status !== Ko
	}
	errors
	get pristine() {
		return ut(this.pristineReactive)
	}
	set pristine(t) {
		ut(() => this.pristineReactive.set(t))
	}
	_pristine = fi(() => this.pristineReactive())
	pristineReactive = oi(!0)
	get dirty() {
		return !this.pristine
	}
	get touched() {
		return ut(this.touchedReactive)
	}
	set touched(t) {
		ut(() => this.touchedReactive.set(t))
	}
	_touched = fi(() => this.touchedReactive())
	touchedReactive = oi(!1)
	get untouched() {
		return !this.touched
	}
	_events = new ie()
	events = this._events.asObservable()
	valueChanges
	statusChanges
	get updateOn() {
		return this._updateOn
			? this._updateOn
			: this.parent
			? this.parent.updateOn
			: 'change'
	}
	setValidators(t) {
		this._assignValidators(t)
	}
	setAsyncValidators(t) {
		this._assignAsyncValidators(t)
	}
	addValidators(t) {
		this.setValidators(Aw(t, this._rawValidators))
	}
	addAsyncValidators(t) {
		this.setAsyncValidators(Aw(t, this._rawAsyncValidators))
	}
	removeValidators(t) {
		this.setValidators(Mw(t, this._rawValidators))
	}
	removeAsyncValidators(t) {
		this.setAsyncValidators(Mw(t, this._rawAsyncValidators))
	}
	hasValidator(t) {
		return eu(this._rawValidators, t)
	}
	hasAsyncValidator(t) {
		return eu(this._rawAsyncValidators, t)
	}
	clearValidators() {
		this.validator = null
	}
	clearAsyncValidators() {
		this.asyncValidator = null
	}
	markAsTouched(t = {}) {
		let n = this.touched === !1
		this.touched = !0
		let r = t.sourceControl ?? this
		this._parent &&
			!t.onlySelf &&
			this._parent.markAsTouched(L(y({}, t), { sourceControl: r })),
			n && t.emitEvent !== !1 && this._events.next(new Zo(!0, r))
	}
	markAllAsTouched(t = {}) {
		this.markAsTouched({
			onlySelf: !0,
			emitEvent: t.emitEvent,
			sourceControl: this,
		}),
			this._forEachChild((n) => n.markAllAsTouched(t))
	}
	markAsUntouched(t = {}) {
		let n = this.touched === !0
		;(this.touched = !1), (this._pendingTouched = !1)
		let r = t.sourceControl ?? this
		this._forEachChild((i) => {
			i.markAsUntouched({
				onlySelf: !0,
				emitEvent: t.emitEvent,
				sourceControl: r,
			})
		}),
			this._parent && !t.onlySelf && this._parent._updateTouched(t, r),
			n && t.emitEvent !== !1 && this._events.next(new Zo(!1, r))
	}
	markAsDirty(t = {}) {
		let n = this.pristine === !0
		this.pristine = !1
		let r = t.sourceControl ?? this
		this._parent &&
			!t.onlySelf &&
			this._parent.markAsDirty(L(y({}, t), { sourceControl: r })),
			n && t.emitEvent !== !1 && this._events.next(new Yo(!1, r))
	}
	markAsPristine(t = {}) {
		let n = this.pristine === !1
		;(this.pristine = !0), (this._pendingDirty = !1)
		let r = t.sourceControl ?? this
		this._forEachChild((i) => {
			i.markAsPristine({ onlySelf: !0, emitEvent: t.emitEvent })
		}),
			this._parent && !t.onlySelf && this._parent._updatePristine(t, r),
			n && t.emitEvent !== !1 && this._events.next(new Yo(!0, r))
	}
	markAsPending(t = {}) {
		this.status = Si
		let n = t.sourceControl ?? this
		t.emitEvent !== !1 &&
			(this._events.next(new Ai(this.status, n)),
			this.statusChanges.emit(this.status)),
			this._parent &&
				!t.onlySelf &&
				this._parent.markAsPending(L(y({}, t), { sourceControl: n }))
	}
	disable(t = {}) {
		let n = this._parentMarkedDirty(t.onlySelf)
		;(this.status = Ko),
			(this.errors = null),
			this._forEachChild((i) => {
				i.disable(L(y({}, t), { onlySelf: !0 }))
			}),
			this._updateValue()
		let r = t.sourceControl ?? this
		t.emitEvent !== !1 &&
			(this._events.next(new nu(this.value, r)),
			this._events.next(new Ai(this.status, r)),
			this.valueChanges.emit(this.value),
			this.statusChanges.emit(this.status)),
			this._updateAncestors(L(y({}, t), { skipPristineCheck: n }), this),
			this._onDisabledChange.forEach((i) => i(!0))
	}
	enable(t = {}) {
		let n = this._parentMarkedDirty(t.onlySelf)
		;(this.status = qo),
			this._forEachChild((r) => {
				r.enable(L(y({}, t), { onlySelf: !0 }))
			}),
			this.updateValueAndValidity({ onlySelf: !0, emitEvent: t.emitEvent }),
			this._updateAncestors(L(y({}, t), { skipPristineCheck: n }), this),
			this._onDisabledChange.forEach((r) => r(!1))
	}
	_updateAncestors(t, n) {
		this._parent &&
			!t.onlySelf &&
			(this._parent.updateValueAndValidity(t),
			t.skipPristineCheck || this._parent._updatePristine({}, n),
			this._parent._updateTouched({}, n))
	}
	setParent(t) {
		this._parent = t
	}
	getRawValue() {
		return this.value
	}
	updateValueAndValidity(t = {}) {
		if ((this._setInitialStatus(), this._updateValue(), this.enabled)) {
			let r = this._cancelExistingSubscription()
			;(this.errors = this._runValidator()),
				(this.status = this._calculateStatus()),
				(this.status === qo || this.status === Si) &&
					this._runAsyncValidator(r, t.emitEvent)
		}
		let n = t.sourceControl ?? this
		t.emitEvent !== !1 &&
			(this._events.next(new nu(this.value, n)),
			this._events.next(new Ai(this.status, n)),
			this.valueChanges.emit(this.value),
			this.statusChanges.emit(this.status)),
			this._parent &&
				!t.onlySelf &&
				this._parent.updateValueAndValidity(L(y({}, t), { sourceControl: n }))
	}
	_updateTreeValidity(t = { emitEvent: !0 }) {
		this._forEachChild((n) => n._updateTreeValidity(t)),
			this.updateValueAndValidity({ onlySelf: !0, emitEvent: t.emitEvent })
	}
	_setInitialStatus() {
		this.status = this._allControlsDisabled() ? Ko : qo
	}
	_runValidator() {
		return this.validator ? this.validator(this) : null
	}
	_runAsyncValidator(t, n) {
		if (this.asyncValidator) {
			;(this.status = Si),
				(this._hasOwnPendingAsyncValidator = { emitEvent: n !== !1 })
			let r = Vw(this.asyncValidator(this))
			this._asyncValidationSubscription = r.subscribe((i) => {
				;(this._hasOwnPendingAsyncValidator = null),
					this.setErrors(i, { emitEvent: n, shouldHaveEmitted: t })
			})
		}
	}
	_cancelExistingSubscription() {
		if (this._asyncValidationSubscription) {
			this._asyncValidationSubscription.unsubscribe()
			let t = this._hasOwnPendingAsyncValidator?.emitEvent ?? !1
			return (this._hasOwnPendingAsyncValidator = null), t
		}
		return !1
	}
	setErrors(t, n = {}) {
		;(this.errors = t),
			this._updateControlsErrors(n.emitEvent !== !1, this, n.shouldHaveEmitted)
	}
	get(t) {
		let n = t
		return n == null || (Array.isArray(n) || (n = n.split('.')), n.length === 0)
			? null
			: n.reduce((r, i) => r && r._find(i), this)
	}
	getError(t, n) {
		let r = n ? this.get(n) : this
		return r && r.errors ? r.errors[t] : null
	}
	hasError(t, n) {
		return !!this.getError(t, n)
	}
	get root() {
		let t = this
		for (; t._parent; ) t = t._parent
		return t
	}
	_updateControlsErrors(t, n, r) {
		;(this.status = this._calculateStatus()),
			t && this.statusChanges.emit(this.status),
			(t || r) && this._events.next(new Ai(this.status, n)),
			this._parent && this._parent._updateControlsErrors(t, n, r)
	}
	_initObservables() {
		;(this.valueChanges = new me()), (this.statusChanges = new me())
	}
	_calculateStatus() {
		return this._allControlsDisabled()
			? Ko
			: this.errors
			? Xc
			: this._hasOwnPendingAsyncValidator || this._anyControlsHaveStatus(Si)
			? Si
			: this._anyControlsHaveStatus(Xc)
			? Xc
			: qo
	}
	_anyControlsHaveStatus(t) {
		return this._anyControls((n) => n.status === t)
	}
	_anyControlsDirty() {
		return this._anyControls((t) => t.dirty)
	}
	_anyControlsTouched() {
		return this._anyControls((t) => t.touched)
	}
	_updatePristine(t, n) {
		let r = !this._anyControlsDirty(),
			i = this.pristine !== r
		;(this.pristine = r),
			this._parent && !t.onlySelf && this._parent._updatePristine(t, n),
			i && this._events.next(new Yo(this.pristine, n))
	}
	_updateTouched(t = {}, n) {
		;(this.touched = this._anyControlsTouched()),
			this._events.next(new Zo(this.touched, n)),
			this._parent && !t.onlySelf && this._parent._updateTouched(t, n)
	}
	_onDisabledChange = []
	_registerOnCollectionChange(t) {
		this._onCollectionChange = t
	}
	_setUpdateStrategy(t) {
		iu(t) && t.updateOn != null && (this._updateOn = t.updateOn)
	}
	_parentMarkedDirty(t) {
		let n = this._parent && this._parent.dirty
		return !t && !!n && !this._parent._anyControlsDirty()
	}
	_find(t) {
		return null
	}
	_assignValidators(t) {
		;(this._rawValidators = Array.isArray(t) ? t.slice() : t),
			(this._composedValidatorFn = nP(this._rawValidators))
	}
	_assignAsyncValidators(t) {
		;(this._rawAsyncValidators = Array.isArray(t) ? t.slice() : t),
			(this._composedAsyncValidatorFn = iP(this._rawAsyncValidators))
	}
}
var zw = new E('', { providedIn: 'root', factory: () => cp }),
	cp = 'always'
function oP(e, t) {
	return [...t.path, e]
}
function sP(e, t, n = cp) {
	cP(e, t),
		t.valueAccessor.writeValue(e.value),
		(e.disabled || n === 'always') &&
			t.valueAccessor.setDisabledState?.(e.disabled),
		uP(e, t),
		dP(e, t),
		lP(e, t),
		aP(e, t)
}
function Rw(e, t) {
	e.forEach((n) => {
		n.registerOnValidatorChange && n.registerOnValidatorChange(t)
	})
}
function aP(e, t) {
	if (t.valueAccessor.setDisabledState) {
		let n = (r) => {
			t.valueAccessor.setDisabledState(r)
		}
		e.registerOnDisabledChange(n),
			t._registerOnDestroy(() => {
				e._unregisterOnDisabledChange(n)
			})
	}
}
function cP(e, t) {
	let n = Jx(e)
	t.validator !== null
		? e.setValidators(Sw(n, t.validator))
		: typeof n == 'function' && e.setValidators([n])
	let r = Xx(e)
	t.asyncValidator !== null
		? e.setAsyncValidators(Sw(r, t.asyncValidator))
		: typeof r == 'function' && e.setAsyncValidators([r])
	let i = () => e.updateValueAndValidity()
	Rw(t._rawValidators, i), Rw(t._rawAsyncValidators, i)
}
function uP(e, t) {
	t.valueAccessor.registerOnChange((n) => {
		;(e._pendingValue = n),
			(e._pendingChange = !0),
			(e._pendingDirty = !0),
			e.updateOn === 'change' && Ww(e, t)
	})
}
function lP(e, t) {
	t.valueAccessor.registerOnTouched(() => {
		;(e._pendingTouched = !0),
			e.updateOn === 'blur' && e._pendingChange && Ww(e, t),
			e.updateOn !== 'submit' && e.markAsTouched()
	})
}
function Ww(e, t) {
	e._pendingDirty && e.markAsDirty(),
		e.setValue(e._pendingValue, { emitModelToViewChange: !1 }),
		t.viewToModelUpdate(e._pendingValue),
		(e._pendingChange = !1)
}
function dP(e, t) {
	let n = (r, i) => {
		t.valueAccessor.writeValue(r), i && t.viewToModelUpdate(r)
	}
	e.registerOnChange(n),
		t._registerOnDestroy(() => {
			e._unregisterOnChange(n)
		})
}
function fP(e, t) {
	if (!e.hasOwnProperty('model')) return !1
	let n = e.model
	return n.isFirstChange() ? !0 : !Object.is(t, n.currentValue)
}
function hP(e) {
	return Object.getPrototypeOf(e.constructor) === Bx
}
function pP(e, t) {
	if (!t) return null
	Array.isArray(t)
	let n, r, i
	return (
		t.forEach((o) => {
			o.constructor === Ri ? (n = o) : hP(o) ? (r = o) : (i = o)
		}),
		i || r || n || null
	)
}
function Nw(e, t) {
	let n = e.indexOf(t)
	n > -1 && e.splice(n, 1)
}
function Ow(e) {
	return (
		typeof e == 'object' &&
		e !== null &&
		Object.keys(e).length === 2 &&
		'value' in e &&
		'disabled' in e
	)
}
var gP = class extends ap {
	defaultValue = null
	_onChange = []
	_pendingValue
	_pendingChange = !1
	constructor(t = null, n, r) {
		super(tP(n), rP(r, n)),
			this._applyFormState(t),
			this._setUpdateStrategy(n),
			this._initObservables(),
			this.updateValueAndValidity({
				onlySelf: !0,
				emitEvent: !!this.asyncValidator,
			}),
			iu(n) &&
				(n.nonNullable || n.initialValueIsDefault) &&
				(Ow(t) ? (this.defaultValue = t.value) : (this.defaultValue = t))
	}
	setValue(t, n = {}) {
		;(this.value = this._pendingValue = t),
			this._onChange.length &&
				n.emitModelToViewChange !== !1 &&
				this._onChange.forEach((r) =>
					r(this.value, n.emitViewToModelChange !== !1)
				),
			this.updateValueAndValidity(n)
	}
	patchValue(t, n = {}) {
		this.setValue(t, n)
	}
	reset(t = this.defaultValue, n = {}) {
		this._applyFormState(t),
			this.markAsPristine(n),
			this.markAsUntouched(n),
			this.setValue(this.value, n),
			(this._pendingChange = !1)
	}
	_updateValue() {}
	_anyControls(t) {
		return !1
	}
	_allControlsDisabled() {
		return this.disabled
	}
	registerOnChange(t) {
		this._onChange.push(t)
	}
	_unregisterOnChange(t) {
		Nw(this._onChange, t)
	}
	registerOnDisabledChange(t) {
		this._onDisabledChange.push(t)
	}
	_unregisterOnDisabledChange(t) {
		Nw(this._onDisabledChange, t)
	}
	_forEachChild(t) {}
	_syncPendingControls() {
		return this.updateOn === 'submit' &&
			(this._pendingDirty && this.markAsDirty(),
			this._pendingTouched && this.markAsTouched(),
			this._pendingChange)
			? (this.setValue(this._pendingValue, {
					onlySelf: !0,
					emitModelToViewChange: !1,
			  }),
			  !0)
			: !1
	}
	_applyFormState(t) {
		Ow(t)
			? ((this.value = this._pendingValue = t.value),
			  t.disabled
					? this.disable({ onlySelf: !0, emitEvent: !1 })
					: this.enable({ onlySelf: !0, emitEvent: !1 }))
			: (this.value = this._pendingValue = t)
	}
}
var mP = { provide: Qo, useExisting: Zr(() => Jo) },
	kw = Promise.resolve(),
	Jo = (() => {
		class e extends Qo {
			_changeDetectorRef
			callSetDisabledState
			control = new gP()
			static ngAcceptInputType_isDisabled
			_registered = !1
			viewModel
			name = ''
			isDisabled
			model
			options
			update = new me()
			constructor(n, r, i, o, s, a) {
				super(),
					(this._changeDetectorRef = s),
					(this.callSetDisabledState = a),
					(this._parent = n),
					this._setValidators(r),
					this._setAsyncValidators(i),
					(this.valueAccessor = pP(this, o))
			}
			ngOnChanges(n) {
				if ((this._checkForErrors(), !this._registered || 'name' in n)) {
					if (this._registered && (this._checkName(), this.formDirective)) {
						let r = n.name.previousValue
						this.formDirective.removeControl({
							name: r,
							path: this._getPath(r),
						})
					}
					this._setUpControl()
				}
				'isDisabled' in n && this._updateDisabled(n),
					fP(n, this.viewModel) &&
						(this._updateValue(this.model), (this.viewModel = this.model))
			}
			ngOnDestroy() {
				this.formDirective && this.formDirective.removeControl(this)
			}
			get path() {
				return this._getPath(this.name)
			}
			get formDirective() {
				return this._parent ? this._parent.formDirective : null
			}
			viewToModelUpdate(n) {
				;(this.viewModel = n), this.update.emit(n)
			}
			_setUpControl() {
				this._setUpdateStrategy(),
					this._isStandalone()
						? this._setUpStandalone()
						: this.formDirective.addControl(this),
					(this._registered = !0)
			}
			_setUpdateStrategy() {
				this.options &&
					this.options.updateOn != null &&
					(this.control._updateOn = this.options.updateOn)
			}
			_isStandalone() {
				return !this._parent || !!(this.options && this.options.standalone)
			}
			_setUpStandalone() {
				sP(this.control, this, this.callSetDisabledState),
					this.control.updateValueAndValidity({ emitEvent: !1 })
			}
			_checkForErrors() {
				this._checkName()
			}
			_checkName() {
				this.options && this.options.name && (this.name = this.options.name),
					!this._isStandalone() && this.name
			}
			_updateValue(n) {
				kw.then(() => {
					this.control.setValue(n, { emitViewToModelChange: !1 }),
						this._changeDetectorRef?.markForCheck()
				})
			}
			_updateDisabled(n) {
				let r = n.isDisabled.currentValue,
					i = r !== 0 && An(r)
				kw.then(() => {
					i && !this.control.disabled
						? this.control.disable()
						: !i && this.control.disabled && this.control.enable(),
						this._changeDetectorRef?.markForCheck()
				})
			}
			_getPath(n) {
				return this._parent ? oP(n, this._parent) : [n]
			}
			static ɵfac = function (r) {
				return new (r || e)(
					M(op, 9),
					M(Fw, 10),
					M(qx, 10),
					M(Pw, 10),
					M(St, 8),
					M(zw, 8)
				)
			}
			static ɵdir = Ce({
				type: e,
				selectors: [
					['', 'ngModel', '', 3, 'formControlName', '', 3, 'formControl', ''],
				],
				inputs: {
					name: 'name',
					isDisabled: [0, 'disabled', 'isDisabled'],
					model: [0, 'ngModel', 'model'],
					options: [0, 'ngModelOptions', 'options'],
				},
				outputs: { update: 'ngModelChange' },
				exportAs: ['ngModel'],
				standalone: !1,
				features: [Ic([mP]), cr, or],
			})
		}
		return e
	})()
var vP = (() => {
	class e {
		_validator = Tw
		_onChange
		_enabled
		ngOnChanges(n) {
			if (this.inputName in n) {
				let r = this.normalizeInput(n[this.inputName].currentValue)
				;(this._enabled = this.enabled(r)),
					(this._validator = this._enabled ? this.createValidator(r) : Tw),
					this._onChange && this._onChange()
			}
		}
		validate(n) {
			return this._validator(n)
		}
		registerOnValidatorChange(n) {
			this._onChange = n
		}
		enabled(n) {
			return n != null
		}
		static ɵfac = function (r) {
			return new (r || e)()
		}
		static ɵdir = Ce({ type: e, features: [or] })
	}
	return e
})()
var yP = { provide: Fw, useExisting: Zr(() => up), multi: !0 }
var up = (() => {
	class e extends vP {
		required
		inputName = 'required'
		normalizeInput = An
		createValidator = (n) => Kx
		enabled(n) {
			return n
		}
		static ɵfac = (() => {
			let n
			return function (i) {
				return (n || (n = ni(e)))(i || e)
			}
		})()
		static ɵdir = Ce({
			type: e,
			selectors: [
				['', 'required', '', 'formControlName', '', 3, 'type', 'checkbox'],
				['', 'required', '', 'formControl', '', 3, 'type', 'checkbox'],
				['', 'required', '', 'ngModel', '', 3, 'type', 'checkbox'],
			],
			hostVars: 1,
			hostBindings: function (r, i) {
				r & 2 && po('required', i._enabled ? '' : null)
			},
			inputs: { required: 'required' },
			standalone: !1,
			features: [Ic([yP]), cr],
		})
	}
	return e
})()
var EP = (() => {
	class e {
		static ɵfac = function (r) {
			return new (r || e)()
		}
		static ɵmod = ct({ type: e })
		static ɵinj = ot({})
	}
	return e
})()
var Ni = (() => {
	class e {
		static withConfig(n) {
			return {
				ngModule: e,
				providers: [{ provide: zw, useValue: n.callSetDisabledState ?? cp }],
			}
		}
		static ɵfac = function (r) {
			return new (r || e)()
		}
		static ɵmod = ct({ type: e })
		static ɵinj = ot({ imports: [EP] })
	}
	return e
})()
var ou = { production: !1, apiUrl: 'http://localhost:5000/api' }
var su = class e {
	constructor(t) {
		this.http = t
	}
	apiUrl = ou.apiUrl
	sendMessage(t) {
		let n = { message: t }
		return this.http.post(`${this.apiUrl}/tattoo/consult`, n)
	}
	static ɵfac = function (n) {
		return new (n || e)(I(Do))
	}
	static ɵprov = _({ token: e, factory: e.ɵfac, providedIn: 'root' })
}
var IP = ['messageContainer']
function wP(e, t) {
	if (
		(e & 1 &&
			($(0, 'div', 11)(1, 'div', 12), re(2), H(), $(3, 'div'), re(4), H()()),
		e & 2)
	) {
		let n = t.$implicit
		Pe(
			'ngClass',
			n.sender === 'user'
				? 'ml-auto bg-emerald-600 text-white'
				: 'mr-auto bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white'
		),
			ne(2),
			Sn(n.sender === 'user' ? 'You' : 'AI Assistant'),
			ne(2),
			Sn(n.text)
	}
}
function DP(e, t) {
	e & 1 &&
		($(0, 'div', 13),
		ao(),
		$(1, 'svg', 14),
		Ze(2, 'path', 15),
		H(),
		wy(),
		$(3, 'p', 16),
		re(4, 'Start a conversation'),
		H(),
		$(5, 'p', 17),
		re(6, 'Type a message below to begin chatting with the AI Assistant'),
		H()())
}
var au = class e {
	constructor(t) {
		this.chatService = t
	}
	messageContainer
	messages = []
	userInput = ''
	ngAfterViewChecked() {
		this.scrollToBottom()
	}
	scrollToBottom() {
		try {
			this.messageContainer &&
				(this.messageContainer.nativeElement.scrollTop =
					this.messageContainer.nativeElement.scrollHeight)
		} catch (t) {
			console.error('Error scrolling to bottom:', t)
		}
	}
	sendMessage() {
		if (!this.userInput.trim()) return
		this.messages.push({ text: this.userInput, sender: 'user' })
		let t = this.userInput
		;(this.userInput = ''),
			this.chatService.sendMessage(t).subscribe({
				next: (n) => {
					this.messages.push({ text: n.response, sender: 'ai' })
				},
				error: (n) => {
					console.error(n),
						this.messages.push({
							text: 'Error: Unable to get a response.',
							sender: 'ai',
						})
				},
			})
	}
	static ɵfac = function (n) {
		return new (n || e)(M(su))
	}
	static ɵcmp = Tt({
		type: e,
		selectors: [['app-chat']],
		viewQuery: function (n, r) {
			if ((n & 1 && m_(IP, 5), n & 2)) {
				let i
				Uf((i = Bf())) && (r.messageContainer = i.first)
			}
		},
		decls: 11,
		vars: 4,
		consts: [
			['messageContainer', ''],
			[
				1,
				'flex',
				'flex-col',
				'h-[calc(100vh-12rem)]',
				'bg-white',
				'dark:bg-gray-800',
				'rounded-xl',
				'shadow-md',
				'overflow-hidden',
			],
			[1, 'flex-grow', 'overflow-y-auto', 'p-4', 'space-y-4'],
			[
				'class',
				'max-w-[80%] rounded-lg p-3 shadow-sm',
				3,
				'ngClass',
				4,
				'ngFor',
				'ngForOf',
			],
			[
				'class',
				'flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400',
				4,
				'ngIf',
			],
			[
				1,
				'border-t',
				'dark:border-gray-700',
				'p-4',
				'bg-gray-50',
				'dark:bg-gray-900',
			],
			[1, 'flex', 'items-center', 'space-x-2'],
			[
				'type',
				'text',
				'placeholder',
				'Type your message here...',
				1,
				'flex-grow',
				'px-4',
				'py-2',
				'border',
				'border-gray-300',
				'dark:border-gray-600',
				'bg-white',
				'dark:bg-gray-700',
				'rounded-lg',
				'focus:ring-2',
				'focus:ring-emerald-500',
				'focus:border-emerald-500',
				'outline-none',
				'transition-colors',
				'dark:text-white',
				3,
				'ngModelChange',
				'keyup.enter',
				'ngModel',
			],
			[
				1,
				'bg-emerald-600',
				'hover:bg-emerald-700',
				'text-white',
				'px-4',
				'py-2',
				'rounded-lg',
				'transition-colors',
				'disabled:opacity-50',
				'disabled:cursor-not-allowed',
				3,
				'click',
				'disabled',
			],
			[
				'xmlns',
				'http://www.w3.org/2000/svg',
				'viewBox',
				'0 0 20 20',
				'fill',
				'currentColor',
				1,
				'h-5',
				'w-5',
			],
			[
				'd',
				'M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z',
			],
			[1, 'max-w-[80%]', 'rounded-lg', 'p-3', 'shadow-sm', 3, 'ngClass'],
			[1, 'font-medium', 'mb-1'],
			[
				1,
				'flex',
				'flex-col',
				'items-center',
				'justify-center',
				'h-full',
				'text-center',
				'text-gray-500',
				'dark:text-gray-400',
			],
			[
				'xmlns',
				'http://www.w3.org/2000/svg',
				'fill',
				'none',
				'viewBox',
				'0 0 24 24',
				'stroke',
				'currentColor',
				1,
				'h-16',
				'w-16',
				'mb-4',
				'text-gray-300',
				'dark:text-gray-600',
			],
			[
				'stroke-linecap',
				'round',
				'stroke-linejoin',
				'round',
				'stroke-width',
				'2',
				'd',
				'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z',
			],
			[1, 'text-lg', 'font-medium'],
			[1, 'text-sm'],
		],
		template: function (n, r) {
			if (n & 1) {
				let i = yc()
				$(0, 'div', 1)(1, 'div', 2, 0),
					Qt(3, wP, 5, 3, 'div', 3)(4, DP, 7, 0, 'div', 4),
					H(),
					$(5, 'div', 5)(6, 'div', 6)(7, 'input', 7),
					mo('ngModelChange', function (s) {
						return Xr(i), _c(r.userInput, s) || (r.userInput = s), ei(s)
					}),
					Ue('keyup.enter', function () {
						return Xr(i), ei(r.sendMessage())
					}),
					H(),
					$(8, 'button', 8),
					Ue('click', function () {
						return Xr(i), ei(r.sendMessage())
					}),
					ao(),
					$(9, 'svg', 9),
					Ze(10, 'path', 10),
					H()()()()()
			}
			n & 2 &&
				(ne(3),
				Pe('ngForOf', r.messages),
				ne(),
				Pe('ngIf', r.messages.length === 0),
				ne(3),
				go('ngModel', r.userInput),
				ne(),
				Pe('disabled', !r.userInput.trim()))
		},
		dependencies: [Mt, $_, H_, gi, Ni, Ri, ru, Jo],
		styles: [
			'.chat-container[_ngcontent-%COMP%]{border:1px solid #ccc;padding:10px;height:300px;overflow-y:auto;margin-bottom:10px}.user[_ngcontent-%COMP%]{text-align:right;margin-bottom:5px}.ai[_ngcontent-%COMP%]{text-align:left;margin-bottom:5px}.input-container[_ngcontent-%COMP%]{display:flex}input[type=text][_ngcontent-%COMP%]{flex:1;padding:8px;font-size:14px}button[_ngcontent-%COMP%]{padding:8px 12px;font-size:14px}',
		],
	})
}
var qw = () => {}
var Yw = function (e) {
		let t = [],
			n = 0
		for (let r = 0; r < e.length; r++) {
			let i = e.charCodeAt(r)
			i < 128
				? (t[n++] = i)
				: i < 2048
				? ((t[n++] = (i >> 6) | 192), (t[n++] = (i & 63) | 128))
				: (i & 64512) === 55296 &&
				  r + 1 < e.length &&
				  (e.charCodeAt(r + 1) & 64512) === 56320
				? ((i = 65536 + ((i & 1023) << 10) + (e.charCodeAt(++r) & 1023)),
				  (t[n++] = (i >> 18) | 240),
				  (t[n++] = ((i >> 12) & 63) | 128),
				  (t[n++] = ((i >> 6) & 63) | 128),
				  (t[n++] = (i & 63) | 128))
				: ((t[n++] = (i >> 12) | 224),
				  (t[n++] = ((i >> 6) & 63) | 128),
				  (t[n++] = (i & 63) | 128))
		}
		return t
	},
	bP = function (e) {
		let t = [],
			n = 0,
			r = 0
		for (; n < e.length; ) {
			let i = e[n++]
			if (i < 128) t[r++] = String.fromCharCode(i)
			else if (i > 191 && i < 224) {
				let o = e[n++]
				t[r++] = String.fromCharCode(((i & 31) << 6) | (o & 63))
			} else if (i > 239 && i < 365) {
				let o = e[n++],
					s = e[n++],
					a = e[n++],
					c =
						(((i & 7) << 18) | ((o & 63) << 12) | ((s & 63) << 6) | (a & 63)) -
						65536
				;(t[r++] = String.fromCharCode(55296 + (c >> 10))),
					(t[r++] = String.fromCharCode(56320 + (c & 1023)))
			} else {
				let o = e[n++],
					s = e[n++]
				t[r++] = String.fromCharCode(
					((i & 15) << 12) | ((o & 63) << 6) | (s & 63)
				)
			}
		}
		return t.join('')
	},
	cu = {
		byteToCharMap_: null,
		charToByteMap_: null,
		byteToCharMapWebSafe_: null,
		charToByteMapWebSafe_: null,
		ENCODED_VALS_BASE:
			'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
		get ENCODED_VALS() {
			return this.ENCODED_VALS_BASE + '+/='
		},
		get ENCODED_VALS_WEBSAFE() {
			return this.ENCODED_VALS_BASE + '-_.'
		},
		HAS_NATIVE_SUPPORT: typeof atob == 'function',
		encodeByteArray(e, t) {
			if (!Array.isArray(e))
				throw Error('encodeByteArray takes an array as a parameter')
			this.init_()
			let n = t ? this.byteToCharMapWebSafe_ : this.byteToCharMap_,
				r = []
			for (let i = 0; i < e.length; i += 3) {
				let o = e[i],
					s = i + 1 < e.length,
					a = s ? e[i + 1] : 0,
					c = i + 2 < e.length,
					u = c ? e[i + 2] : 0,
					l = o >> 2,
					d = ((o & 3) << 4) | (a >> 4),
					h = ((a & 15) << 2) | (u >> 6),
					f = u & 63
				c || ((f = 64), s || (h = 64)), r.push(n[l], n[d], n[h], n[f])
			}
			return r.join('')
		},
		encodeString(e, t) {
			return this.HAS_NATIVE_SUPPORT && !t
				? btoa(e)
				: this.encodeByteArray(Yw(e), t)
		},
		decodeString(e, t) {
			return this.HAS_NATIVE_SUPPORT && !t
				? atob(e)
				: bP(this.decodeStringToByteArray(e, t))
		},
		decodeStringToByteArray(e, t) {
			this.init_()
			let n = t ? this.charToByteMapWebSafe_ : this.charToByteMap_,
				r = []
			for (let i = 0; i < e.length; ) {
				let o = n[e.charAt(i++)],
					a = i < e.length ? n[e.charAt(i)] : 0
				++i
				let u = i < e.length ? n[e.charAt(i)] : 64
				++i
				let d = i < e.length ? n[e.charAt(i)] : 64
				if ((++i, o == null || a == null || u == null || d == null))
					throw new fp()
				let h = (o << 2) | (a >> 4)
				if ((r.push(h), u !== 64)) {
					let f = ((a << 4) & 240) | (u >> 2)
					if ((r.push(f), d !== 64)) {
						let m = ((u << 6) & 192) | d
						r.push(m)
					}
				}
			}
			return r
		},
		init_() {
			if (!this.byteToCharMap_) {
				;(this.byteToCharMap_ = {}),
					(this.charToByteMap_ = {}),
					(this.byteToCharMapWebSafe_ = {}),
					(this.charToByteMapWebSafe_ = {})
				for (let e = 0; e < this.ENCODED_VALS.length; e++)
					(this.byteToCharMap_[e] = this.ENCODED_VALS.charAt(e)),
						(this.charToByteMap_[this.byteToCharMap_[e]] = e),
						(this.byteToCharMapWebSafe_[e] =
							this.ENCODED_VALS_WEBSAFE.charAt(e)),
						(this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[e]] = e),
						e >= this.ENCODED_VALS_BASE.length &&
							((this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(e)] = e),
							(this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(e)] = e))
			}
		},
	},
	fp = class extends Error {
		constructor() {
			super(...arguments), (this.name = 'DecodeBase64StringError')
		}
	},
	CP = function (e) {
		let t = Yw(e)
		return cu.encodeByteArray(t, !0)
	},
	pp = function (e) {
		return CP(e).replace(/\./g, '')
	},
	uu = function (e) {
		try {
			return cu.decodeString(e, !0)
		} catch (t) {
			console.error('base64Decode failed: ', t)
		}
		return null
	}
function Zw() {
	if (typeof self < 'u') return self
	if (typeof window < 'u') return window
	if (typeof global < 'u') return global
	throw new Error('Unable to locate global object.')
}
var TP = () => Zw().__FIREBASE_DEFAULTS__,
	SP = () => {
		if (typeof process > 'u' || typeof process.env > 'u') return
		let e = process.env.__FIREBASE_DEFAULTS__
		if (e) return JSON.parse(e)
	},
	AP = () => {
		if (typeof document > 'u') return
		let e
		try {
			e = document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)
		} catch {
			return
		}
		let t = e && uu(e[1])
		return t && JSON.parse(t)
	},
	gp = () => {
		try {
			return qw() || TP() || SP() || AP()
		} catch (e) {
			console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${e}`)
			return
		}
	},
	Qw = (e) => {
		var t, n
		return (n =
			(t = gp()) === null || t === void 0 ? void 0 : t.emulatorHosts) ===
			null || n === void 0
			? void 0
			: n[e]
	}
var mp = () => {
		var e
		return (e = gp()) === null || e === void 0 ? void 0 : e.config
	},
	vp = (e) => {
		var t
		return (t = gp()) === null || t === void 0 ? void 0 : t[`_${e}`]
	}
var hr = class {
	constructor() {
		;(this.reject = () => {}),
			(this.resolve = () => {}),
			(this.promise = new Promise((t, n) => {
				;(this.resolve = t), (this.reject = n)
			}))
	}
	wrapCallback(t) {
		return (n, r) => {
			n ? this.reject(n) : this.resolve(r),
				typeof t == 'function' &&
					(this.promise.catch(() => {}), t.length === 1 ? t(n) : t(n, r))
		}
	}
}
function we() {
	return typeof navigator < 'u' && typeof navigator.userAgent == 'string'
		? navigator.userAgent
		: ''
}
function Jw() {
	return (
		typeof window < 'u' &&
		!!(window.cordova || window.phonegap || window.PhoneGap) &&
		/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(we())
	)
}
function Xw() {
	return typeof navigator < 'u' && navigator.userAgent === 'Cloudflare-Workers'
}
function eD() {
	let e =
		typeof chrome == 'object'
			? chrome.runtime
			: typeof browser == 'object'
			? browser.runtime
			: void 0
	return typeof e == 'object' && e.id !== void 0
}
function tD() {
	return typeof navigator == 'object' && navigator.product === 'ReactNative'
}
function nD() {
	let e = we()
	return e.indexOf('MSIE ') >= 0 || e.indexOf('Trident/') >= 0
}
function lu() {
	try {
		return typeof indexedDB == 'object'
	} catch {
		return !1
	}
}
function rD() {
	return new Promise((e, t) => {
		try {
			let n = !0,
				r = 'validate-browser-context-for-indexeddb-analytics-module',
				i = self.indexedDB.open(r)
			;(i.onsuccess = () => {
				i.result.close(), n || self.indexedDB.deleteDatabase(r), e(!0)
			}),
				(i.onupgradeneeded = () => {
					n = !1
				}),
				(i.onerror = () => {
					var o
					t(((o = i.error) === null || o === void 0 ? void 0 : o.message) || '')
				})
		} catch (n) {
			t(n)
		}
	})
}
var MP = 'FirebaseError',
	dt = class e extends Error {
		constructor(t, n, r) {
			super(n),
				(this.code = t),
				(this.customData = r),
				(this.name = MP),
				Object.setPrototypeOf(this, e.prototype),
				Error.captureStackTrace &&
					Error.captureStackTrace(this, ft.prototype.create)
		}
	},
	ft = class {
		constructor(t, n, r) {
			;(this.service = t), (this.serviceName = n), (this.errors = r)
		}
		create(t, ...n) {
			let r = n[0] || {},
				i = `${this.service}/${t}`,
				o = this.errors[t],
				s = o ? RP(o, r) : 'Error',
				a = `${this.serviceName}: ${s} (${i}).`
			return new dt(i, a, r)
		}
	}
function RP(e, t) {
	return e.replace(NP, (n, r) => {
		let i = t[r]
		return i != null ? String(i) : `<${r}?>`
	})
}
var NP = /\{\$([^}]+)}/g
function iD(e) {
	for (let t in e) if (Object.prototype.hasOwnProperty.call(e, t)) return !1
	return !0
}
function Pn(e, t) {
	if (e === t) return !0
	let n = Object.keys(e),
		r = Object.keys(t)
	for (let i of n) {
		if (!r.includes(i)) return !1
		let o = e[i],
			s = t[i]
		if (Kw(o) && Kw(s)) {
			if (!Pn(o, s)) return !1
		} else if (o !== s) return !1
	}
	for (let i of r) if (!n.includes(i)) return !1
	return !0
}
function Kw(e) {
	return e !== null && typeof e == 'object'
}
function Oi(e) {
	let t = []
	for (let [n, r] of Object.entries(e))
		Array.isArray(r)
			? r.forEach((i) => {
					t.push(encodeURIComponent(n) + '=' + encodeURIComponent(i))
			  })
			: t.push(encodeURIComponent(n) + '=' + encodeURIComponent(r))
	return t.length ? '&' + t.join('&') : ''
}
function oD(e, t) {
	let n = new hp(e, t)
	return n.subscribe.bind(n)
}
var hp = class {
	constructor(t, n) {
		;(this.observers = []),
			(this.unsubscribes = []),
			(this.observerCount = 0),
			(this.task = Promise.resolve()),
			(this.finalized = !1),
			(this.onNoObservers = n),
			this.task
				.then(() => {
					t(this)
				})
				.catch((r) => {
					this.error(r)
				})
	}
	next(t) {
		this.forEachObserver((n) => {
			n.next(t)
		})
	}
	error(t) {
		this.forEachObserver((n) => {
			n.error(t)
		}),
			this.close(t)
	}
	complete() {
		this.forEachObserver((t) => {
			t.complete()
		}),
			this.close()
	}
	subscribe(t, n, r) {
		let i
		if (t === void 0 && n === void 0 && r === void 0)
			throw new Error('Missing Observer.')
		OP(t, ['next', 'error', 'complete'])
			? (i = t)
			: (i = { next: t, error: n, complete: r }),
			i.next === void 0 && (i.next = dp),
			i.error === void 0 && (i.error = dp),
			i.complete === void 0 && (i.complete = dp)
		let o = this.unsubscribeOne.bind(this, this.observers.length)
		return (
			this.finalized &&
				this.task.then(() => {
					try {
						this.finalError ? i.error(this.finalError) : i.complete()
					} catch {}
				}),
			this.observers.push(i),
			o
		)
	}
	unsubscribeOne(t) {
		this.observers === void 0 ||
			this.observers[t] === void 0 ||
			(delete this.observers[t],
			(this.observerCount -= 1),
			this.observerCount === 0 &&
				this.onNoObservers !== void 0 &&
				this.onNoObservers(this))
	}
	forEachObserver(t) {
		if (!this.finalized)
			for (let n = 0; n < this.observers.length; n++) this.sendOne(n, t)
	}
	sendOne(t, n) {
		this.task.then(() => {
			if (this.observers !== void 0 && this.observers[t] !== void 0)
				try {
					n(this.observers[t])
				} catch (r) {
					typeof console < 'u' && console.error && console.error(r)
				}
		})
	}
	close(t) {
		this.finalized ||
			((this.finalized = !0),
			t !== void 0 && (this.finalError = t),
			this.task.then(() => {
				;(this.observers = void 0), (this.onNoObservers = void 0)
			}))
	}
}
function OP(e, t) {
	if (typeof e != 'object' || e === null) return !1
	for (let n of t) if (n in e && typeof e[n] == 'function') return !0
	return !1
}
function dp() {}
var k3 = 4 * 60 * 60 * 1e3
function nn(e) {
	return e && e._delegate ? e._delegate : e
}
var He = class {
	constructor(t, n, r) {
		;(this.name = t),
			(this.instanceFactory = n),
			(this.type = r),
			(this.multipleInstances = !1),
			(this.serviceProps = {}),
			(this.instantiationMode = 'LAZY'),
			(this.onInstanceCreated = null)
	}
	setInstantiationMode(t) {
		return (this.instantiationMode = t), this
	}
	setMultipleInstances(t) {
		return (this.multipleInstances = t), this
	}
	setServiceProps(t) {
		return (this.serviceProps = t), this
	}
	setInstanceCreatedCallback(t) {
		return (this.onInstanceCreated = t), this
	}
}
var pr = '[DEFAULT]'
var yp = class {
	constructor(t, n) {
		;(this.name = t),
			(this.container = n),
			(this.component = null),
			(this.instances = new Map()),
			(this.instancesDeferred = new Map()),
			(this.instancesOptions = new Map()),
			(this.onInitCallbacks = new Map())
	}
	get(t) {
		let n = this.normalizeInstanceIdentifier(t)
		if (!this.instancesDeferred.has(n)) {
			let r = new hr()
			if (
				(this.instancesDeferred.set(n, r),
				this.isInitialized(n) || this.shouldAutoInitialize())
			)
				try {
					let i = this.getOrInitializeService({ instanceIdentifier: n })
					i && r.resolve(i)
				} catch {}
		}
		return this.instancesDeferred.get(n).promise
	}
	getImmediate(t) {
		var n
		let r = this.normalizeInstanceIdentifier(t?.identifier),
			i = (n = t?.optional) !== null && n !== void 0 ? n : !1
		if (this.isInitialized(r) || this.shouldAutoInitialize())
			try {
				return this.getOrInitializeService({ instanceIdentifier: r })
			} catch (o) {
				if (i) return null
				throw o
			}
		else {
			if (i) return null
			throw Error(`Service ${this.name} is not available`)
		}
	}
	getComponent() {
		return this.component
	}
	setComponent(t) {
		if (t.name !== this.name)
			throw Error(`Mismatching Component ${t.name} for Provider ${this.name}.`)
		if (this.component)
			throw Error(`Component for ${this.name} has already been provided`)
		if (((this.component = t), !!this.shouldAutoInitialize())) {
			if (xP(t))
				try {
					this.getOrInitializeService({ instanceIdentifier: pr })
				} catch {}
			for (let [n, r] of this.instancesDeferred.entries()) {
				let i = this.normalizeInstanceIdentifier(n)
				try {
					let o = this.getOrInitializeService({ instanceIdentifier: i })
					r.resolve(o)
				} catch {}
			}
		}
	}
	clearInstance(t = pr) {
		this.instancesDeferred.delete(t),
			this.instancesOptions.delete(t),
			this.instances.delete(t)
	}
	delete() {
		return p(this, null, function* () {
			let t = Array.from(this.instances.values())
			yield Promise.all([
				...t.filter((n) => 'INTERNAL' in n).map((n) => n.INTERNAL.delete()),
				...t.filter((n) => '_delete' in n).map((n) => n._delete()),
			])
		})
	}
	isComponentSet() {
		return this.component != null
	}
	isInitialized(t = pr) {
		return this.instances.has(t)
	}
	getOptions(t = pr) {
		return this.instancesOptions.get(t) || {}
	}
	initialize(t = {}) {
		let { options: n = {} } = t,
			r = this.normalizeInstanceIdentifier(t.instanceIdentifier)
		if (this.isInitialized(r))
			throw Error(`${this.name}(${r}) has already been initialized`)
		if (!this.isComponentSet())
			throw Error(`Component ${this.name} has not been registered yet`)
		let i = this.getOrInitializeService({ instanceIdentifier: r, options: n })
		for (let [o, s] of this.instancesDeferred.entries()) {
			let a = this.normalizeInstanceIdentifier(o)
			r === a && s.resolve(i)
		}
		return i
	}
	onInit(t, n) {
		var r
		let i = this.normalizeInstanceIdentifier(n),
			o =
				(r = this.onInitCallbacks.get(i)) !== null && r !== void 0
					? r
					: new Set()
		o.add(t), this.onInitCallbacks.set(i, o)
		let s = this.instances.get(i)
		return (
			s && t(s, i),
			() => {
				o.delete(t)
			}
		)
	}
	invokeOnInitCallbacks(t, n) {
		let r = this.onInitCallbacks.get(n)
		if (r)
			for (let i of r)
				try {
					i(t, n)
				} catch {}
	}
	getOrInitializeService({ instanceIdentifier: t, options: n = {} }) {
		let r = this.instances.get(t)
		if (
			!r &&
			this.component &&
			((r = this.component.instanceFactory(this.container, {
				instanceIdentifier: kP(t),
				options: n,
			})),
			this.instances.set(t, r),
			this.instancesOptions.set(t, n),
			this.invokeOnInitCallbacks(r, t),
			this.component.onInstanceCreated)
		)
			try {
				this.component.onInstanceCreated(this.container, t, r)
			} catch {}
		return r || null
	}
	normalizeInstanceIdentifier(t = pr) {
		return this.component ? (this.component.multipleInstances ? t : pr) : t
	}
	shouldAutoInitialize() {
		return !!this.component && this.component.instantiationMode !== 'EXPLICIT'
	}
}
function kP(e) {
	return e === pr ? void 0 : e
}
function xP(e) {
	return e.instantiationMode === 'EAGER'
}
var du = class {
	constructor(t) {
		;(this.name = t), (this.providers = new Map())
	}
	addComponent(t) {
		let n = this.getProvider(t.name)
		if (n.isComponentSet())
			throw new Error(
				`Component ${t.name} has already been registered with ${this.name}`
			)
		n.setComponent(t)
	}
	addOrOverwriteComponent(t) {
		this.getProvider(t.name).isComponentSet() && this.providers.delete(t.name),
			this.addComponent(t)
	}
	getProvider(t) {
		if (this.providers.has(t)) return this.providers.get(t)
		let n = new yp(t, this)
		return this.providers.set(t, n), n
	}
	getProviders() {
		return Array.from(this.providers.values())
	}
}
var PP = [],
	Y = (function (e) {
		return (
			(e[(e.DEBUG = 0)] = 'DEBUG'),
			(e[(e.VERBOSE = 1)] = 'VERBOSE'),
			(e[(e.INFO = 2)] = 'INFO'),
			(e[(e.WARN = 3)] = 'WARN'),
			(e[(e.ERROR = 4)] = 'ERROR'),
			(e[(e.SILENT = 5)] = 'SILENT'),
			e
		)
	})(Y || {}),
	FP = {
		debug: Y.DEBUG,
		verbose: Y.VERBOSE,
		info: Y.INFO,
		warn: Y.WARN,
		error: Y.ERROR,
		silent: Y.SILENT,
	},
	LP = Y.INFO,
	VP = {
		[Y.DEBUG]: 'log',
		[Y.VERBOSE]: 'log',
		[Y.INFO]: 'info',
		[Y.WARN]: 'warn',
		[Y.ERROR]: 'error',
	},
	jP = (e, t, ...n) => {
		if (t < e.logLevel) return
		let r = new Date().toISOString(),
			i = VP[t]
		if (i) console[i](`[${r}]  ${e.name}:`, ...n)
		else
			throw new Error(
				`Attempted to log a message with an invalid logType (value: ${t})`
			)
	},
	Fn = class {
		constructor(t) {
			;(this.name = t),
				(this._logLevel = LP),
				(this._logHandler = jP),
				(this._userLogHandler = null),
				PP.push(this)
		}
		get logLevel() {
			return this._logLevel
		}
		set logLevel(t) {
			if (!(t in Y))
				throw new TypeError(`Invalid value "${t}" assigned to \`logLevel\``)
			this._logLevel = t
		}
		setLogLevel(t) {
			this._logLevel = typeof t == 'string' ? FP[t] : t
		}
		get logHandler() {
			return this._logHandler
		}
		set logHandler(t) {
			if (typeof t != 'function')
				throw new TypeError('Value assigned to `logHandler` must be a function')
			this._logHandler = t
		}
		get userLogHandler() {
			return this._userLogHandler
		}
		set userLogHandler(t) {
			this._userLogHandler = t
		}
		debug(...t) {
			this._userLogHandler && this._userLogHandler(this, Y.DEBUG, ...t),
				this._logHandler(this, Y.DEBUG, ...t)
		}
		log(...t) {
			this._userLogHandler && this._userLogHandler(this, Y.VERBOSE, ...t),
				this._logHandler(this, Y.VERBOSE, ...t)
		}
		info(...t) {
			this._userLogHandler && this._userLogHandler(this, Y.INFO, ...t),
				this._logHandler(this, Y.INFO, ...t)
		}
		warn(...t) {
			this._userLogHandler && this._userLogHandler(this, Y.WARN, ...t),
				this._logHandler(this, Y.WARN, ...t)
		}
		error(...t) {
			this._userLogHandler && this._userLogHandler(this, Y.ERROR, ...t),
				this._logHandler(this, Y.ERROR, ...t)
		}
	}
var UP = (e, t) => t.some((n) => e instanceof n),
	sD,
	aD
function BP() {
	return (
		sD ||
		(sD = [IDBDatabase, IDBObjectStore, IDBIndex, IDBCursor, IDBTransaction])
	)
}
function $P() {
	return (
		aD ||
		(aD = [
			IDBCursor.prototype.advance,
			IDBCursor.prototype.continue,
			IDBCursor.prototype.continuePrimaryKey,
		])
	)
}
var cD = new WeakMap(),
	_p = new WeakMap(),
	uD = new WeakMap(),
	Ep = new WeakMap(),
	wp = new WeakMap()
function HP(e) {
	let t = new Promise((n, r) => {
		let i = () => {
				e.removeEventListener('success', o), e.removeEventListener('error', s)
			},
			o = () => {
				n(xt(e.result)), i()
			},
			s = () => {
				r(e.error), i()
			}
		e.addEventListener('success', o), e.addEventListener('error', s)
	})
	return (
		t
			.then((n) => {
				n instanceof IDBCursor && cD.set(n, e)
			})
			.catch(() => {}),
		wp.set(t, e),
		t
	)
}
function zP(e) {
	if (_p.has(e)) return
	let t = new Promise((n, r) => {
		let i = () => {
				e.removeEventListener('complete', o),
					e.removeEventListener('error', s),
					e.removeEventListener('abort', s)
			},
			o = () => {
				n(), i()
			},
			s = () => {
				r(e.error || new DOMException('AbortError', 'AbortError')), i()
			}
		e.addEventListener('complete', o),
			e.addEventListener('error', s),
			e.addEventListener('abort', s)
	})
	_p.set(e, t)
}
var Ip = {
	get(e, t, n) {
		if (e instanceof IDBTransaction) {
			if (t === 'done') return _p.get(e)
			if (t === 'objectStoreNames') return e.objectStoreNames || uD.get(e)
			if (t === 'store')
				return n.objectStoreNames[1]
					? void 0
					: n.objectStore(n.objectStoreNames[0])
		}
		return xt(e[t])
	},
	set(e, t, n) {
		return (e[t] = n), !0
	},
	has(e, t) {
		return e instanceof IDBTransaction && (t === 'done' || t === 'store')
			? !0
			: t in e
	},
}
function lD(e) {
	Ip = e(Ip)
}
function WP(e) {
	return e === IDBDatabase.prototype.transaction &&
		!('objectStoreNames' in IDBTransaction.prototype)
		? function (t, ...n) {
				let r = e.call(fu(this), t, ...n)
				return uD.set(r, t.sort ? t.sort() : [t]), xt(r)
		  }
		: $P().includes(e)
		? function (...t) {
				return e.apply(fu(this), t), xt(cD.get(this))
		  }
		: function (...t) {
				return xt(e.apply(fu(this), t))
		  }
}
function GP(e) {
	return typeof e == 'function'
		? WP(e)
		: (e instanceof IDBTransaction && zP(e), UP(e, BP()) ? new Proxy(e, Ip) : e)
}
function xt(e) {
	if (e instanceof IDBRequest) return HP(e)
	if (Ep.has(e)) return Ep.get(e)
	let t = GP(e)
	return t !== e && (Ep.set(e, t), wp.set(t, e)), t
}
var fu = (e) => wp.get(e)
function fD(e, t, { blocked: n, upgrade: r, blocking: i, terminated: o } = {}) {
	let s = indexedDB.open(e, t),
		a = xt(s)
	return (
		r &&
			s.addEventListener('upgradeneeded', (c) => {
				r(xt(s.result), c.oldVersion, c.newVersion, xt(s.transaction), c)
			}),
		n && s.addEventListener('blocked', (c) => n(c.oldVersion, c.newVersion, c)),
		a
			.then((c) => {
				o && c.addEventListener('close', () => o()),
					i &&
						c.addEventListener('versionchange', (u) =>
							i(u.oldVersion, u.newVersion, u)
						)
			})
			.catch(() => {}),
		a
	)
}
var qP = ['get', 'getKey', 'getAll', 'getAllKeys', 'count'],
	KP = ['put', 'add', 'delete', 'clear'],
	Dp = new Map()
function dD(e, t) {
	if (!(e instanceof IDBDatabase && !(t in e) && typeof t == 'string')) return
	if (Dp.get(t)) return Dp.get(t)
	let n = t.replace(/FromIndex$/, ''),
		r = t !== n,
		i = KP.includes(n)
	if (
		!(n in (r ? IDBIndex : IDBObjectStore).prototype) ||
		!(i || qP.includes(n))
	)
		return
	let o = function (s, ...a) {
		return p(this, null, function* () {
			let c = this.transaction(s, i ? 'readwrite' : 'readonly'),
				u = c.store
			return (
				r && (u = u.index(a.shift())),
				(yield Promise.all([u[n](...a), i && c.done]))[0]
			)
		})
	}
	return Dp.set(t, o), o
}
lD((e) =>
	L(y({}, e), {
		get: (t, n, r) => dD(t, n) || e.get(t, n, r),
		has: (t, n) => !!dD(t, n) || e.has(t, n),
	})
)
var Cp = class {
	constructor(t) {
		this.container = t
	}
	getPlatformInfoString() {
		return this.container
			.getProviders()
			.map((n) => {
				if (YP(n)) {
					let r = n.getImmediate()
					return `${r.library}/${r.version}`
				} else return null
			})
			.filter((n) => n)
			.join(' ')
	}
}
function YP(e) {
	let t = e.getComponent()
	return t?.type === 'VERSION'
}
var Tp = '@firebase/app',
	hD = '0.11.2'
var rn = new Fn('@firebase/app'),
	ZP = '@firebase/app-compat',
	QP = '@firebase/analytics-compat',
	JP = '@firebase/analytics',
	XP = '@firebase/app-check-compat',
	eF = '@firebase/app-check',
	tF = '@firebase/auth',
	nF = '@firebase/auth-compat',
	rF = '@firebase/database',
	iF = '@firebase/data-connect',
	oF = '@firebase/database-compat',
	sF = '@firebase/functions',
	aF = '@firebase/functions-compat',
	cF = '@firebase/installations',
	uF = '@firebase/installations-compat',
	lF = '@firebase/messaging',
	dF = '@firebase/messaging-compat',
	fF = '@firebase/performance',
	hF = '@firebase/performance-compat',
	pF = '@firebase/remote-config',
	gF = '@firebase/remote-config-compat',
	mF = '@firebase/storage',
	vF = '@firebase/storage-compat',
	yF = '@firebase/firestore',
	EF = '@firebase/vertexai',
	_F = '@firebase/firestore-compat',
	IF = 'firebase',
	wF = '11.4.0'
var Sp = '[DEFAULT]',
	DF = {
		[Tp]: 'fire-core',
		[ZP]: 'fire-core-compat',
		[JP]: 'fire-analytics',
		[QP]: 'fire-analytics-compat',
		[eF]: 'fire-app-check',
		[XP]: 'fire-app-check-compat',
		[tF]: 'fire-auth',
		[nF]: 'fire-auth-compat',
		[rF]: 'fire-rtdb',
		[iF]: 'fire-data-connect',
		[oF]: 'fire-rtdb-compat',
		[sF]: 'fire-fn',
		[aF]: 'fire-fn-compat',
		[cF]: 'fire-iid',
		[uF]: 'fire-iid-compat',
		[lF]: 'fire-fcm',
		[dF]: 'fire-fcm-compat',
		[fF]: 'fire-perf',
		[hF]: 'fire-perf-compat',
		[pF]: 'fire-rc',
		[gF]: 'fire-rc-compat',
		[mF]: 'fire-gcs',
		[vF]: 'fire-gcs-compat',
		[yF]: 'fire-fst',
		[_F]: 'fire-fst-compat',
		[EF]: 'fire-vertex',
		'fire-js': 'fire-js',
		[IF]: 'fire-js-all',
	}
var Xo = new Map(),
	bF = new Map(),
	Ap = new Map()
function pD(e, t) {
	try {
		e.container.addComponent(t)
	} catch (n) {
		rn.debug(
			`Component ${t.name} failed to register with FirebaseApp ${e.name}`,
			n
		)
	}
}
function on(e) {
	let t = e.name
	if (Ap.has(t))
		return (
			rn.debug(`There were multiple attempts to register component ${t}.`), !1
		)
	Ap.set(t, e)
	for (let n of Xo.values()) pD(n, e)
	for (let n of bF.values()) pD(n, e)
	return !0
}
function hu(e, t) {
	let n = e.container.getProvider('heartbeat').getImmediate({ optional: !0 })
	return n && n.triggerHeartbeat(), e.container.getProvider(t)
}
function ht(e) {
	return e == null ? !1 : e.settings !== void 0
}
var CF = {
		'no-app':
			"No Firebase App '{$appName}' has been created - call initializeApp() first",
		'bad-app-name': "Illegal App name: '{$appName}'",
		'duplicate-app':
			"Firebase App named '{$appName}' already exists with different options or config",
		'app-deleted': "Firebase App named '{$appName}' already deleted",
		'server-app-deleted': 'Firebase Server App has been deleted',
		'no-options':
			'Need to provide options, when not being deployed to hosting via source.',
		'invalid-app-argument':
			'firebase.{$appName}() takes either no argument or a Firebase App instance.',
		'invalid-log-argument':
			'First argument to `onLog` must be null or a function.',
		'idb-open':
			'Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.',
		'idb-get':
			'Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.',
		'idb-set':
			'Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.',
		'idb-delete':
			'Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.',
		'finalization-registry-not-supported':
			'FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.',
		'invalid-server-app-environment':
			'FirebaseServerApp is not for use in browser environments.',
	},
	Ln = new ft('app', 'Firebase', CF)
var Mp = class {
	constructor(t, n, r) {
		;(this._isDeleted = !1),
			(this._options = Object.assign({}, t)),
			(this._config = Object.assign({}, n)),
			(this._name = n.name),
			(this._automaticDataCollectionEnabled = n.automaticDataCollectionEnabled),
			(this._container = r),
			this.container.addComponent(new He('app', () => this, 'PUBLIC'))
	}
	get automaticDataCollectionEnabled() {
		return this.checkDestroyed(), this._automaticDataCollectionEnabled
	}
	set automaticDataCollectionEnabled(t) {
		this.checkDestroyed(), (this._automaticDataCollectionEnabled = t)
	}
	get name() {
		return this.checkDestroyed(), this._name
	}
	get options() {
		return this.checkDestroyed(), this._options
	}
	get config() {
		return this.checkDestroyed(), this._config
	}
	get container() {
		return this._container
	}
	get isDeleted() {
		return this._isDeleted
	}
	set isDeleted(t) {
		this._isDeleted = t
	}
	checkDestroyed() {
		if (this.isDeleted) throw Ln.create('app-deleted', { appName: this._name })
	}
}
var ki = wF
function Op(e, t = {}) {
	let n = e
	typeof t != 'object' && (t = { name: t })
	let r = Object.assign({ name: Sp, automaticDataCollectionEnabled: !1 }, t),
		i = r.name
	if (typeof i != 'string' || !i)
		throw Ln.create('bad-app-name', { appName: String(i) })
	if ((n || (n = mp()), !n)) throw Ln.create('no-options')
	let o = Xo.get(i)
	if (o) {
		if (Pn(n, o.options) && Pn(r, o.config)) return o
		throw Ln.create('duplicate-app', { appName: i })
	}
	let s = new du(i)
	for (let c of Ap.values()) s.addComponent(c)
	let a = new Mp(n, r, s)
	return Xo.set(i, a), a
}
function ts(e = Sp) {
	let t = Xo.get(e)
	if (!t && e === Sp && mp()) return Op()
	if (!t) throw Ln.create('no-app', { appName: e })
	return t
}
function pu() {
	return Array.from(Xo.values())
}
function Ee(e, t, n) {
	var r
	let i = (r = DF[e]) !== null && r !== void 0 ? r : e
	n && (i += `-${n}`)
	let o = i.match(/\s|\//),
		s = t.match(/\s|\//)
	if (o || s) {
		let a = [`Unable to register library "${i}" with version "${t}":`]
		o &&
			a.push(
				`library name "${i}" contains illegal characters (whitespace or "/")`
			),
			o && s && a.push('and'),
			s &&
				a.push(
					`version name "${t}" contains illegal characters (whitespace or "/")`
				),
			rn.warn(a.join(' '))
		return
	}
	on(new He(`${i}-version`, () => ({ library: i, version: t }), 'VERSION'))
}
var TF = 'firebase-heartbeat-database',
	SF = 1,
	es = 'firebase-heartbeat-store',
	bp = null
function yD() {
	return (
		bp ||
			(bp = fD(TF, SF, {
				upgrade: (e, t) => {
					switch (t) {
						case 0:
							try {
								e.createObjectStore(es)
							} catch (n) {
								console.warn(n)
							}
					}
				},
			}).catch((e) => {
				throw Ln.create('idb-open', { originalErrorMessage: e.message })
			})),
		bp
	)
}
function AF(e) {
	return p(this, null, function* () {
		try {
			let n = (yield yD()).transaction(es),
				r = yield n.objectStore(es).get(ED(e))
			return yield n.done, r
		} catch (t) {
			if (t instanceof dt) rn.warn(t.message)
			else {
				let n = Ln.create('idb-get', { originalErrorMessage: t?.message })
				rn.warn(n.message)
			}
		}
	})
}
function gD(e, t) {
	return p(this, null, function* () {
		try {
			let r = (yield yD()).transaction(es, 'readwrite')
			yield r.objectStore(es).put(t, ED(e)), yield r.done
		} catch (n) {
			if (n instanceof dt) rn.warn(n.message)
			else {
				let r = Ln.create('idb-set', { originalErrorMessage: n?.message })
				rn.warn(r.message)
			}
		}
	})
}
function ED(e) {
	return `${e.name}!${e.options.appId}`
}
var MF = 1024,
	RF = 30,
	Rp = class {
		constructor(t) {
			;(this.container = t), (this._heartbeatsCache = null)
			let n = this.container.getProvider('app').getImmediate()
			;(this._storage = new Np(n)),
				(this._heartbeatsCachePromise = this._storage
					.read()
					.then((r) => ((this._heartbeatsCache = r), r)))
		}
		triggerHeartbeat() {
			return p(this, null, function* () {
				var t, n
				try {
					let i = this.container
							.getProvider('platform-logger')
							.getImmediate()
							.getPlatformInfoString(),
						o = mD()
					if (
						(((t = this._heartbeatsCache) === null || t === void 0
							? void 0
							: t.heartbeats) == null &&
							((this._heartbeatsCache = yield this._heartbeatsCachePromise),
							((n = this._heartbeatsCache) === null || n === void 0
								? void 0
								: n.heartbeats) == null)) ||
						this._heartbeatsCache.lastSentHeartbeatDate === o ||
						this._heartbeatsCache.heartbeats.some((s) => s.date === o)
					)
						return
					if (
						(this._heartbeatsCache.heartbeats.push({ date: o, agent: i }),
						this._heartbeatsCache.heartbeats.length > RF)
					) {
						let s = OF(this._heartbeatsCache.heartbeats)
						this._heartbeatsCache.heartbeats.splice(s, 1)
					}
					return this._storage.overwrite(this._heartbeatsCache)
				} catch (r) {
					rn.warn(r)
				}
			})
		}
		getHeartbeatsHeader() {
			return p(this, null, function* () {
				var t
				try {
					if (
						(this._heartbeatsCache === null &&
							(yield this._heartbeatsCachePromise),
						((t = this._heartbeatsCache) === null || t === void 0
							? void 0
							: t.heartbeats) == null ||
							this._heartbeatsCache.heartbeats.length === 0)
					)
						return ''
					let n = mD(),
						{ heartbeatsToSend: r, unsentEntries: i } = NF(
							this._heartbeatsCache.heartbeats
						),
						o = pp(JSON.stringify({ version: 2, heartbeats: r }))
					return (
						(this._heartbeatsCache.lastSentHeartbeatDate = n),
						i.length > 0
							? ((this._heartbeatsCache.heartbeats = i),
							  yield this._storage.overwrite(this._heartbeatsCache))
							: ((this._heartbeatsCache.heartbeats = []),
							  this._storage.overwrite(this._heartbeatsCache)),
						o
					)
				} catch (n) {
					return rn.warn(n), ''
				}
			})
		}
	}
function mD() {
	return new Date().toISOString().substring(0, 10)
}
function NF(e, t = MF) {
	let n = [],
		r = e.slice()
	for (let i of e) {
		let o = n.find((s) => s.agent === i.agent)
		if (o) {
			if ((o.dates.push(i.date), vD(n) > t)) {
				o.dates.pop()
				break
			}
		} else if ((n.push({ agent: i.agent, dates: [i.date] }), vD(n) > t)) {
			n.pop()
			break
		}
		r = r.slice(1)
	}
	return { heartbeatsToSend: n, unsentEntries: r }
}
var Np = class {
	constructor(t) {
		;(this.app = t),
			(this._canUseIndexedDBPromise = this.runIndexedDBEnvironmentCheck())
	}
	runIndexedDBEnvironmentCheck() {
		return p(this, null, function* () {
			return lu()
				? rD()
						.then(() => !0)
						.catch(() => !1)
				: !1
		})
	}
	read() {
		return p(this, null, function* () {
			if (yield this._canUseIndexedDBPromise) {
				let n = yield AF(this.app)
				return n?.heartbeats ? n : { heartbeats: [] }
			} else return { heartbeats: [] }
		})
	}
	overwrite(t) {
		return p(this, null, function* () {
			var n
			if (yield this._canUseIndexedDBPromise) {
				let i = yield this.read()
				return gD(this.app, {
					lastSentHeartbeatDate:
						(n = t.lastSentHeartbeatDate) !== null && n !== void 0
							? n
							: i.lastSentHeartbeatDate,
					heartbeats: t.heartbeats,
				})
			} else return
		})
	}
	add(t) {
		return p(this, null, function* () {
			var n
			if (yield this._canUseIndexedDBPromise) {
				let i = yield this.read()
				return gD(this.app, {
					lastSentHeartbeatDate:
						(n = t.lastSentHeartbeatDate) !== null && n !== void 0
							? n
							: i.lastSentHeartbeatDate,
					heartbeats: [...i.heartbeats, ...t.heartbeats],
				})
			} else return
		})
	}
}
function vD(e) {
	return pp(JSON.stringify({ version: 2, heartbeats: e })).length
}
function OF(e) {
	if (e.length === 0) return -1
	let t = 0,
		n = e[0].date
	for (let r = 1; r < e.length; r++) e[r].date < n && ((n = e[r].date), (t = r))
	return t
}
function kF(e) {
	on(new He('platform-logger', (t) => new Cp(t), 'PRIVATE')),
		on(new He('heartbeat', (t) => new Rp(t), 'PRIVATE')),
		Ee(Tp, hD, e),
		Ee(Tp, hD, 'esm2017'),
		Ee('fire-js', '')
}
kF('')
var xF = 'firebase',
	PF = '11.4.0'
Ee(xF, PF, 'app')
function kp(e) {
	e === void 0 && (Ba(kp), (e = g(ae)))
	let t = e.get(Ya)
	return (n) =>
		new P((r) => {
			let i = t.add(),
				o = !1
			function s() {
				o || (i(), (o = !0))
			}
			let a = n.subscribe({
				next: (c) => {
					r.next(c), s()
				},
				complete: () => {
					r.complete(), s()
				},
				error: (c) => {
					r.error(c), s()
				},
			})
			return (
				a.add(() => {
					r.unsubscribe(), s()
				}),
				a
			)
		})
}
var Pi = new Yt('ANGULARFIRE2_VERSION')
function xp(e, t, n) {
	if (t) {
		if (t.length === 1) return t[0]
		let o = t.filter((s) => s.app === n)
		if (o.length === 1) return o[0]
	}
	return n.container.getProvider(e).getImmediate({ optional: !0 })
}
var mu = (e, t) => {
		let n = t ? [t] : pu(),
			r = []
		return (
			n.forEach((i) => {
				i.container.getProvider(e).instances.forEach((s) => {
					r.includes(s) || r.push(s)
				})
			}),
			r
		)
	},
	xi = (function (e) {
		return (
			(e[(e.SILENT = 0)] = 'SILENT'),
			(e[(e.WARN = 1)] = 'WARN'),
			(e[(e.VERBOSE = 2)] = 'VERBOSE'),
			e
		)
	})(xi || {}),
	_D = Hf() && typeof Zone < 'u' ? xi.WARN : xi.SILENT
var gu = class {
		zone
		delegate
		constructor(t, n = fl) {
			;(this.zone = t), (this.delegate = n)
		}
		now() {
			return this.delegate.now()
		}
		schedule(t, n, r) {
			let i = this.zone,
				o = function (s) {
					i
						? i.runGuarded(() => {
								t.apply(this, [s])
						  })
						: t.apply(this, [s])
				}
			return this.delegate.schedule(o, n, r)
		}
	},
	Fi = (() => {
		class e {
			outsideAngular
			insideAngular
			constructor() {
				let n = g(j)
				;(this.outsideAngular = n.runOutsideAngular(
					() => new gu(typeof Zone > 'u' ? void 0 : Zone.current)
				)),
					(this.insideAngular = n.run(
						() => new gu(typeof Zone > 'u' ? void 0 : Zone.current, dl)
					))
			}
			static ɵfac = function (r) {
				return new (r || e)()
			}
			static ɵprov = _({ token: e, factory: e.ɵfac, providedIn: 'root' })
		}
		return e
	})(),
	ID = !1
function FF(e, t) {
	!ID &&
		(_D > xi.SILENT || Hf()) &&
		((ID = !0),
		console.warn(
			'Calling Firebase APIs outside of an Injection context may destabilize your application leading to subtle change-detection and hydration bugs. Find more at https://github.com/angular/angularfire/blob/main/docs/zones.md'
		)),
		_D >= t &&
			console.warn(`Firebase API called outside injection context: ${e.name}`)
}
function LF(e) {
	let t = g(j, { optional: !0 })
	return t ? t.runOutsideAngular(() => e()) : e()
}
function gr(e) {
	let t = g(j, { optional: !0 })
	return t ? t.run(() => e()) : e()
}
var VF =
		(e, t, n) =>
		(...r) => (
			t && setTimeout(t, 0), he(n, () => gr(() => e.apply(void 0, r)))
		),
	mr = (e, t, n) => (
		(n ||= t ? xi.WARN : xi.VERBOSE),
		function () {
			let r,
				i = arguments,
				o,
				s,
				a
			try {
				;(o = g(Fi)), (s = g(Ya)), (a = g(fe))
			} catch {
				return FF(e, n), e.apply(this, i)
			}
			for (let u = 0; u < arguments.length; u++)
				typeof i[u] == 'function' &&
					(t && (r ||= gr(() => s.add())), (i[u] = VF(i[u], r, a)))
			let c = LF(() => e.apply(this, i))
			return t
				? c instanceof P
					? c.pipe(fn(o.outsideAngular), dn(o.insideAngular), kp(a))
					: c instanceof Promise
					? gr(
							() =>
								new Promise((u, l) => {
									s.run(() => c).then(
										(d) => he(a, () => gr(() => u(d))),
										(d) => he(a, () => gr(() => l(d)))
									)
								})
					  )
					: typeof c == 'function' && r
					? function () {
							return setTimeout(r, 0), c.apply(this, arguments)
					  }
					: gr(() => c)
				: c instanceof P
				? c.pipe(fn(o.outsideAngular), dn(o.insideAngular))
				: gr(() => c)
		}
	)
var vr = class {
		constructor(t) {
			return t
		}
	},
	ns = class {
		constructor() {
			return pu()
		}
	}
function jF(e) {
	return e && e.length === 1 ? e[0] : new vr(ts())
}
var Pp = new E('angularfire2._apps'),
	UF = { provide: vr, useFactory: jF, deps: [[new Zt(), Pp]] },
	BF = { provide: ns, deps: [[new Zt(), Pp]] }
function $F(e) {
	return (t, n) => {
		let r = n.get(ye)
		Ee('angularfire', Pi.full, 'core'),
			Ee('angularfire', Pi.full, 'app'),
			Ee('angular', D_.full, r.toString())
		let i = t.runOutsideAngular(() => e(n))
		return new vr(i)
	}
}
function wD(e, ...t) {
	return qe([
		UF,
		BF,
		{ provide: Pp, useFactory: $F(e), multi: !0, deps: [j, ae, Fi, ...t] },
	])
}
var DD = mr(Op, !0)
var HF = new Map(),
	zF = { activated: !1, tokenObservers: [] },
	WF = { initialized: !1, enabled: !1 }
function pt(e) {
	return HF.get(e) || Object.assign({}, zF)
}
function SD() {
	return WF
}
var GF = 'https://content-firebaseappcheck.googleapis.com/v1'
var qF = 'exchangeDebugToken',
	bD = {
		OFFSET_DURATION: 5 * 60 * 1e3,
		RETRIAL_MIN_WAIT: 30 * 1e3,
		RETRIAL_MAX_WAIT: 16 * 60 * 1e3,
	},
	VG = 24 * 60 * 60 * 1e3
var Vp = class {
	constructor(t, n, r, i, o) {
		if (
			((this.operation = t),
			(this.retryPolicy = n),
			(this.getWaitDuration = r),
			(this.lowerBound = i),
			(this.upperBound = o),
			(this.pending = null),
			(this.nextErrorWaitInterval = i),
			i > o)
		)
			throw new Error('Proactive refresh lower bound greater than upper bound!')
	}
	start() {
		;(this.nextErrorWaitInterval = this.lowerBound),
			this.process(!0).catch(() => {})
	}
	stop() {
		this.pending && (this.pending.reject('cancelled'), (this.pending = null))
	}
	isRunning() {
		return !!this.pending
	}
	process(t) {
		return p(this, null, function* () {
			this.stop()
			try {
				;(this.pending = new hr()),
					this.pending.promise.catch((n) => {}),
					yield KF(this.getNextRun(t)),
					this.pending.resolve(),
					yield this.pending.promise,
					(this.pending = new hr()),
					this.pending.promise.catch((n) => {}),
					yield this.operation(),
					this.pending.resolve(),
					yield this.pending.promise,
					this.process(!0).catch(() => {})
			} catch (n) {
				this.retryPolicy(n) ? this.process(!1).catch(() => {}) : this.stop()
			}
		})
	}
	getNextRun(t) {
		if (t)
			return (
				(this.nextErrorWaitInterval = this.lowerBound), this.getWaitDuration()
			)
		{
			let n = this.nextErrorWaitInterval
			return (
				(this.nextErrorWaitInterval *= 2),
				this.nextErrorWaitInterval > this.upperBound &&
					(this.nextErrorWaitInterval = this.upperBound),
				n
			)
		}
	}
}
function KF(e) {
	return new Promise((t) => {
		setTimeout(t, e)
	})
}
var YF = {
		'already-initialized':
			'You have already called initializeAppCheck() for FirebaseApp {$appName} with different options. To avoid this error, call initializeAppCheck() with the same options as when it was originally called. This will return the already initialized instance.',
		'use-before-activation':
			'App Check is being used before initializeAppCheck() is called for FirebaseApp {$appName}. Call initializeAppCheck() before instantiating other Firebase services.',
		'fetch-network-error':
			'Fetch failed to connect to a network. Check Internet connection. Original error: {$originalErrorMessage}.',
		'fetch-parse-error':
			'Fetch client could not parse response. Original error: {$originalErrorMessage}.',
		'fetch-status-error':
			'Fetch server returned an HTTP error status. HTTP status: {$httpStatus}.',
		'storage-open':
			'Error thrown when opening storage. Original error: {$originalErrorMessage}.',
		'storage-get':
			'Error thrown when reading from storage. Original error: {$originalErrorMessage}.',
		'storage-set':
			'Error thrown when writing to storage. Original error: {$originalErrorMessage}.',
		'recaptcha-error': 'ReCAPTCHA error.',
		throttled:
			'Requests throttled due to {$httpStatus} error. Attempts allowed again after {$time}',
	},
	Vn = new ft('appCheck', 'AppCheck', YF)
function AD(e) {
	if (!pt(e).activated)
		throw Vn.create('use-before-activation', { appName: e.name })
}
function MD(r, i) {
	return p(this, arguments, function* ({ url: e, body: t }, n) {
		let o = { 'Content-Type': 'application/json' },
			s = n.getImmediate({ optional: !0 })
		if (s) {
			let f = yield s.getHeartbeatsHeader()
			f && (o['X-Firebase-Client'] = f)
		}
		let a = { method: 'POST', body: JSON.stringify(t), headers: o },
			c
		try {
			c = yield fetch(e, a)
		} catch (f) {
			throw Vn.create('fetch-network-error', {
				originalErrorMessage: f?.message,
			})
		}
		if (c.status !== 200)
			throw Vn.create('fetch-status-error', { httpStatus: c.status })
		let u
		try {
			u = yield c.json()
		} catch (f) {
			throw Vn.create('fetch-parse-error', { originalErrorMessage: f?.message })
		}
		let l = u.ttl.match(/^([\d.]+)(s)$/)
		if (!l || !l[2] || isNaN(Number(l[1])))
			throw Vn.create('fetch-parse-error', {
				originalErrorMessage: `ttl field (timeToLive) is not in standard Protobuf Duration format: ${u.ttl}`,
			})
		let d = Number(l[1]) * 1e3,
			h = Date.now()
		return { token: u.token, expireTimeMillis: h + d, issuedAtTimeMillis: h }
	})
}
function RD(e, t) {
	let { projectId: n, appId: r, apiKey: i } = e.options
	return {
		url: `${GF}/projects/${n}/apps/${r}:${qF}?key=${i}`,
		body: { debug_token: t },
	}
}
var ZF = 'firebase-app-check-database',
	QF = 1,
	jp = 'firebase-app-check-store'
var vu = null
function JF() {
	return (
		vu ||
		((vu = new Promise((e, t) => {
			try {
				let n = indexedDB.open(ZF, QF)
				;(n.onsuccess = (r) => {
					e(r.target.result)
				}),
					(n.onerror = (r) => {
						var i
						t(
							Vn.create('storage-open', {
								originalErrorMessage:
									(i = r.target.error) === null || i === void 0
										? void 0
										: i.message,
							})
						)
					}),
					(n.onupgradeneeded = (r) => {
						let i = r.target.result
						switch (r.oldVersion) {
							case 0:
								i.createObjectStore(jp, { keyPath: 'compositeKey' })
						}
					})
			} catch (n) {
				t(Vn.create('storage-open', { originalErrorMessage: n?.message }))
			}
		})),
		vu)
	)
}
function XF(e, t) {
	return eL(tL(e), t)
}
function eL(e, t) {
	return p(this, null, function* () {
		let r = (yield JF()).transaction(jp, 'readwrite'),
			o = r.objectStore(jp).put({ compositeKey: e, value: t })
		return new Promise((s, a) => {
			;(o.onsuccess = (c) => {
				s()
			}),
				(r.onerror = (c) => {
					var u
					a(
						Vn.create('storage-set', {
							originalErrorMessage:
								(u = c.target.error) === null || u === void 0
									? void 0
									: u.message,
						})
					)
				})
		})
	})
}
function tL(e) {
	return `${e.options.appId}-${e.name}`
}
var rs = new Fn('@firebase/app-check')
function Fp(e, t) {
	return lu()
		? XF(e, t).catch((n) => {
				rs.warn(`Failed to write token to IndexedDB. Error: ${n}`)
		  })
		: Promise.resolve()
}
function ND() {
	return SD().enabled
}
function OD() {
	return p(this, null, function* () {
		let e = SD()
		if (e.enabled && e.token) return e.token.promise
		throw Error(`
            Can't get debug token in production mode.
        `)
	})
}
var nL = { error: 'UNKNOWN_ERROR' }
function rL(e) {
	return cu.encodeString(JSON.stringify(e), !1)
}
function Up(e, t = !1) {
	return p(this, null, function* () {
		let n = e.app
		AD(n)
		let r = pt(n),
			i = r.token,
			o
		if ((i && !is(i) && ((r.token = void 0), (i = void 0)), !i)) {
			let c = yield r.cachedTokenPromise
			c && (is(c) ? (i = c) : yield Fp(n, void 0))
		}
		if (!t && i && is(i)) return { token: i.token }
		let s = !1
		if (ND())
			try {
				r.exchangeTokenPromise ||
					((r.exchangeTokenPromise = MD(
						RD(n, yield OD()),
						e.heartbeatServiceProvider
					).finally(() => {
						r.exchangeTokenPromise = void 0
					})),
					(s = !0))
				let c = yield r.exchangeTokenPromise
				return yield Fp(n, c), (r.token = c), { token: c.token }
			} catch (c) {
				return (
					c.code === 'appCheck/throttled' ? rs.warn(c.message) : rs.error(c),
					Lp(c)
				)
			}
		try {
			r.exchangeTokenPromise ||
				((r.exchangeTokenPromise = r.provider.getToken().finally(() => {
					r.exchangeTokenPromise = void 0
				})),
				(s = !0)),
				(i = yield pt(n).exchangeTokenPromise)
		} catch (c) {
			c.code === 'appCheck/throttled' ? rs.warn(c.message) : rs.error(c),
				(o = c)
		}
		let a
		return (
			i
				? o
					? is(i)
						? (a = { token: i.token, internalError: o })
						: (a = Lp(o))
					: ((a = { token: i.token }), (r.token = i), yield Fp(n, i))
				: (a = Lp(o)),
			s && aL(n, a),
			a
		)
	})
}
function iL(e) {
	return p(this, null, function* () {
		let t = e.app
		AD(t)
		let { provider: n } = pt(t)
		if (ND()) {
			let r = yield OD(),
				{ token: i } = yield MD(RD(t, r), e.heartbeatServiceProvider)
			return { token: i }
		} else {
			let { token: r } = yield n.getToken()
			return { token: r }
		}
	})
}
function oL(e, t, n, r) {
	let { app: i } = e,
		o = pt(i),
		s = { next: n, error: r, type: t }
	if (((o.tokenObservers = [...o.tokenObservers, s]), o.token && is(o.token))) {
		let a = o.token
		Promise.resolve()
			.then(() => {
				n({ token: a.token }), CD(e)
			})
			.catch(() => {})
	}
	o.cachedTokenPromise.then(() => CD(e))
}
function kD(e, t) {
	let n = pt(e),
		r = n.tokenObservers.filter((i) => i.next !== t)
	r.length === 0 &&
		n.tokenRefresher &&
		n.tokenRefresher.isRunning() &&
		n.tokenRefresher.stop(),
		(n.tokenObservers = r)
}
function CD(e) {
	let { app: t } = e,
		n = pt(t),
		r = n.tokenRefresher
	r || ((r = sL(e)), (n.tokenRefresher = r)),
		!r.isRunning() && n.isTokenAutoRefreshEnabled && r.start()
}
function sL(e) {
	let { app: t } = e
	return new Vp(
		() =>
			p(this, null, function* () {
				let n = pt(t),
					r
				if ((n.token ? (r = yield Up(e, !0)) : (r = yield Up(e)), r.error))
					throw r.error
				if (r.internalError) throw r.internalError
			}),
		() => !0,
		() => {
			let n = pt(t)
			if (n.token) {
				let r =
						n.token.issuedAtTimeMillis +
						(n.token.expireTimeMillis - n.token.issuedAtTimeMillis) * 0.5 +
						3e5,
					i = n.token.expireTimeMillis - 5 * 60 * 1e3
				return (r = Math.min(r, i)), Math.max(0, r - Date.now())
			} else return 0
		},
		bD.RETRIAL_MIN_WAIT,
		bD.RETRIAL_MAX_WAIT
	)
}
function aL(e, t) {
	let n = pt(e).tokenObservers
	for (let r of n)
		try {
			r.type === 'EXTERNAL' && t.error != null ? r.error(t.error) : r.next(t)
		} catch {}
}
function is(e) {
	return e.expireTimeMillis - Date.now() > 0
}
function Lp(e) {
	return { token: rL(nL), error: e }
}
var Bp = class {
	constructor(t, n) {
		;(this.app = t), (this.heartbeatServiceProvider = n)
	}
	_delete() {
		let { tokenObservers: t } = pt(this.app)
		for (let n of t) kD(this.app, n.next)
		return Promise.resolve()
	}
}
function cL(e, t) {
	return new Bp(e, t)
}
function uL(e) {
	return {
		getToken: (t) => Up(e, t),
		getLimitedUseToken: () => iL(e),
		addTokenListener: (t) => oL(e, 'INTERNAL', t),
		removeTokenListener: (t) => kD(e.app, t),
	}
}
var lL = '@firebase/app-check',
	dL = '0.8.12'
var fL = 'app-check',
	TD = 'app-check-internal'
function hL() {
	on(
		new He(
			fL,
			(e) => {
				let t = e.getProvider('app').getImmediate(),
					n = e.getProvider('heartbeat')
				return cL(t, n)
			},
			'PUBLIC'
		)
			.setInstantiationMode('EXPLICIT')
			.setInstanceCreatedCallback((e, t, n) => {
				e.getProvider(TD).initialize()
			})
	),
		on(
			new He(
				TD,
				(e) => {
					let t = e.getProvider('app-check').getImmediate()
					return uL(t)
				},
				'PUBLIC'
			).setInstantiationMode('EXPLICIT')
		),
		Ee(lL, dL)
}
hL()
var pL = 'app-check'
var yu = class {
	constructor() {
		return mu(pL)
	}
}
var gL = ['localhost', '0.0.0.0', '127.0.0.1'],
	QG = typeof window < 'u' && gL.includes(window.location.hostname)
function KD() {
	return {
		'dependent-sdk-initialized-before-auth':
			'Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK.',
	}
}
var YD = KD,
	ZD = new ft('auth', 'Firebase', KD())
var bu = new Fn('@firebase/auth')
function mL(e, ...t) {
	bu.logLevel <= Y.WARN && bu.warn(`Auth (${ki}): ${e}`, ...t)
}
function _u(e, ...t) {
	bu.logLevel <= Y.ERROR && bu.error(`Auth (${ki}): ${e}`, ...t)
}
function Ft(e, ...t) {
	throw og(e, ...t)
}
function gt(e, ...t) {
	return og(e, ...t)
}
function ig(e, t, n) {
	let r = Object.assign(Object.assign({}, YD()), { [t]: n })
	return new ft('auth', 'Firebase', r).create(t, { appName: e.name })
}
function yr(e) {
	return ig(
		e,
		'operation-not-supported-in-this-environment',
		'Operations that alter the current user are not supported in conjunction with FirebaseServerApp'
	)
}
function vL(e, t, n) {
	let r = n
	if (!(t instanceof r))
		throw (
			(r.name !== t.constructor.name && Ft(e, 'argument-error'),
			ig(
				e,
				'argument-error',
				`Type of ${t.constructor.name} does not match expected instance.Did you pass a reference from a different Auth SDK?`
			))
		)
}
function og(e, ...t) {
	if (typeof e != 'string') {
		let n = t[0],
			r = [...t.slice(1)]
		return r[0] && (r[0].appName = e.name), e._errorFactory.create(n, ...r)
	}
	return ZD.create(e, ...t)
}
function A(e, t, ...n) {
	if (!e) throw og(t, ...n)
}
function sn(e) {
	let t = 'INTERNAL ASSERTION FAILED: ' + e
	throw (_u(t), new Error(t))
}
function cn(e, t) {
	e || sn(t)
}
function zp() {
	var e
	return (
		(typeof self < 'u' &&
			((e = self.location) === null || e === void 0 ? void 0 : e.href)) ||
		''
	)
}
function yL() {
	return xD() === 'http:' || xD() === 'https:'
}
function xD() {
	var e
	return (
		(typeof self < 'u' &&
			((e = self.location) === null || e === void 0 ? void 0 : e.protocol)) ||
		null
	)
}
function EL() {
	return typeof navigator < 'u' &&
		navigator &&
		'onLine' in navigator &&
		typeof navigator.onLine == 'boolean' &&
		(yL() || eD() || 'connection' in navigator)
		? navigator.onLine
		: !0
}
function _L() {
	if (typeof navigator > 'u') return null
	let e = navigator
	return (e.languages && e.languages[0]) || e.language || null
}
var Er = class {
	constructor(t, n) {
		;(this.shortDelay = t),
			(this.longDelay = n),
			cn(n > t, 'Short delay should be less than long delay!'),
			(this.isMobile = Jw() || tD())
	}
	get() {
		return EL()
			? this.isMobile
				? this.longDelay
				: this.shortDelay
			: Math.min(5e3, this.shortDelay)
	}
}
function sg(e, t) {
	cn(e.emulator, 'Emulator should always be set here')
	let { url: n } = e.emulator
	return t ? `${n}${t.startsWith('/') ? t.slice(1) : t}` : n
}
var Cu = class {
	static initialize(t, n, r) {
		;(this.fetchImpl = t),
			n && (this.headersImpl = n),
			r && (this.responseImpl = r)
	}
	static fetch() {
		if (this.fetchImpl) return this.fetchImpl
		if (typeof self < 'u' && 'fetch' in self) return self.fetch
		if (typeof globalThis < 'u' && globalThis.fetch) return globalThis.fetch
		if (typeof fetch < 'u') return fetch
		sn(
			'Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill'
		)
	}
	static headers() {
		if (this.headersImpl) return this.headersImpl
		if (typeof self < 'u' && 'Headers' in self) return self.Headers
		if (typeof globalThis < 'u' && globalThis.Headers) return globalThis.Headers
		if (typeof Headers < 'u') return Headers
		sn(
			'Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill'
		)
	}
	static response() {
		if (this.responseImpl) return this.responseImpl
		if (typeof self < 'u' && 'Response' in self) return self.Response
		if (typeof globalThis < 'u' && globalThis.Response)
			return globalThis.Response
		if (typeof Response < 'u') return Response
		sn(
			'Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill'
		)
	}
}
var IL = {
	CREDENTIAL_MISMATCH: 'custom-token-mismatch',
	MISSING_CUSTOM_TOKEN: 'internal-error',
	INVALID_IDENTIFIER: 'invalid-email',
	MISSING_CONTINUE_URI: 'internal-error',
	INVALID_PASSWORD: 'wrong-password',
	MISSING_PASSWORD: 'missing-password',
	INVALID_LOGIN_CREDENTIALS: 'invalid-credential',
	EMAIL_EXISTS: 'email-already-in-use',
	PASSWORD_LOGIN_DISABLED: 'operation-not-allowed',
	INVALID_IDP_RESPONSE: 'invalid-credential',
	INVALID_PENDING_TOKEN: 'invalid-credential',
	FEDERATED_USER_ID_ALREADY_LINKED: 'credential-already-in-use',
	MISSING_REQ_TYPE: 'internal-error',
	EMAIL_NOT_FOUND: 'user-not-found',
	RESET_PASSWORD_EXCEED_LIMIT: 'too-many-requests',
	EXPIRED_OOB_CODE: 'expired-action-code',
	INVALID_OOB_CODE: 'invalid-action-code',
	MISSING_OOB_CODE: 'internal-error',
	CREDENTIAL_TOO_OLD_LOGIN_AGAIN: 'requires-recent-login',
	INVALID_ID_TOKEN: 'invalid-user-token',
	TOKEN_EXPIRED: 'user-token-expired',
	USER_NOT_FOUND: 'user-token-expired',
	TOO_MANY_ATTEMPTS_TRY_LATER: 'too-many-requests',
	PASSWORD_DOES_NOT_MEET_REQUIREMENTS: 'password-does-not-meet-requirements',
	INVALID_CODE: 'invalid-verification-code',
	INVALID_SESSION_INFO: 'invalid-verification-id',
	INVALID_TEMPORARY_PROOF: 'invalid-credential',
	MISSING_SESSION_INFO: 'missing-verification-id',
	SESSION_EXPIRED: 'code-expired',
	MISSING_ANDROID_PACKAGE_NAME: 'missing-android-pkg-name',
	UNAUTHORIZED_DOMAIN: 'unauthorized-continue-uri',
	INVALID_OAUTH_CLIENT_ID: 'invalid-oauth-client-id',
	ADMIN_ONLY_OPERATION: 'admin-restricted-operation',
	INVALID_MFA_PENDING_CREDENTIAL: 'invalid-multi-factor-session',
	MFA_ENROLLMENT_NOT_FOUND: 'multi-factor-info-not-found',
	MISSING_MFA_ENROLLMENT_ID: 'missing-multi-factor-info',
	MISSING_MFA_PENDING_CREDENTIAL: 'missing-multi-factor-session',
	SECOND_FACTOR_EXISTS: 'second-factor-already-in-use',
	SECOND_FACTOR_LIMIT_EXCEEDED: 'maximum-second-factor-count-exceeded',
	BLOCKING_FUNCTION_ERROR_RESPONSE: 'internal-error',
	RECAPTCHA_NOT_ENABLED: 'recaptcha-not-enabled',
	MISSING_RECAPTCHA_TOKEN: 'missing-recaptcha-token',
	INVALID_RECAPTCHA_TOKEN: 'invalid-recaptcha-token',
	INVALID_RECAPTCHA_ACTION: 'invalid-recaptcha-action',
	MISSING_CLIENT_TYPE: 'missing-client-type',
	MISSING_RECAPTCHA_VERSION: 'missing-recaptcha-version',
	INVALID_RECAPTCHA_VERSION: 'invalid-recaptcha-version',
	INVALID_REQ_TYPE: 'invalid-req-type',
}
var wL = new Er(3e4, 6e4)
function ag(e, t) {
	return e.tenantId && !t.tenantId
		? Object.assign(Object.assign({}, t), { tenantId: e.tenantId })
		: t
}
function ji(o, s, a, c) {
	return p(this, arguments, function* (e, t, n, r, i = {}) {
		return QD(e, i, () =>
			p(this, null, function* () {
				let u = {},
					l = {}
				r && (t === 'GET' ? (l = r) : (u = { body: JSON.stringify(r) }))
				let d = Oi(Object.assign({ key: e.config.apiKey }, l)).slice(1),
					h = yield e._getAdditionalHeaders()
				;(h['Content-Type'] = 'application/json'),
					e.languageCode && (h['X-Firebase-Locale'] = e.languageCode)
				let f = Object.assign({ method: t, headers: h }, u)
				return (
					Xw() || (f.referrerPolicy = 'no-referrer'),
					Cu.fetch()(JD(e, e.config.apiHost, n, d), f)
				)
			})
		)
	})
}
function QD(e, t, n) {
	return p(this, null, function* () {
		e._canInitEmulator = !1
		let r = Object.assign(Object.assign({}, IL), t)
		try {
			let i = new Wp(e),
				o = yield Promise.race([n(), i.promise])
			i.clearNetworkTimeout()
			let s = yield o.json()
			if ('needConfirmation' in s)
				throw Eu(e, 'account-exists-with-different-credential', s)
			if (o.ok && !('errorMessage' in s)) return s
			{
				let a = o.ok ? s.errorMessage : s.error.message,
					[c, u] = a.split(' : ')
				if (c === 'FEDERATED_USER_ID_ALREADY_LINKED')
					throw Eu(e, 'credential-already-in-use', s)
				if (c === 'EMAIL_EXISTS') throw Eu(e, 'email-already-in-use', s)
				if (c === 'USER_DISABLED') throw Eu(e, 'user-disabled', s)
				let l = r[c] || c.toLowerCase().replace(/[_\s]+/g, '-')
				if (u) throw ig(e, l, u)
				Ft(e, l)
			}
		} catch (i) {
			if (i instanceof dt) throw i
			Ft(e, 'network-request-failed', { message: String(i) })
		}
	})
}
function DL(o, s, a, c) {
	return p(this, arguments, function* (e, t, n, r, i = {}) {
		let u = yield ji(e, t, n, r, i)
		return (
			'mfaPendingCredential' in u &&
				Ft(e, 'multi-factor-auth-required', { _serverResponse: u }),
			u
		)
	})
}
function JD(e, t, n, r) {
	let i = `${t}${n}?${r}`
	return e.config.emulator ? sg(e.config, i) : `${e.config.apiScheme}://${i}`
}
var Wp = class {
	clearNetworkTimeout() {
		clearTimeout(this.timer)
	}
	constructor(t) {
		;(this.auth = t),
			(this.timer = null),
			(this.promise = new Promise((n, r) => {
				this.timer = setTimeout(
					() => r(gt(this.auth, 'network-request-failed')),
					wL.get()
				)
			}))
	}
}
function Eu(e, t, n) {
	let r = { appName: e.name }
	n.email && (r.email = n.email),
		n.phoneNumber && (r.phoneNumber = n.phoneNumber)
	let i = gt(e, t, r)
	return (i.customData._tokenResponse = n), i
}
function bL(e, t) {
	return p(this, null, function* () {
		return ji(e, 'POST', '/v1/accounts:delete', t)
	})
}
function XD(e, t) {
	return p(this, null, function* () {
		return ji(e, 'POST', '/v1/accounts:lookup', t)
	})
}
function os(e) {
	if (e)
		try {
			let t = new Date(Number(e))
			if (!isNaN(t.getTime())) return t.toUTCString()
		} catch {}
}
function cg(e, t = !1) {
	return p(this, null, function* () {
		let n = nn(e),
			r = yield n.getIdToken(t),
			i = ug(r)
		A(i && i.exp && i.auth_time && i.iat, n.auth, 'internal-error')
		let o = typeof i.firebase == 'object' ? i.firebase : void 0,
			s = o?.sign_in_provider
		return {
			claims: i,
			token: r,
			authTime: os($p(i.auth_time)),
			issuedAtTime: os($p(i.iat)),
			expirationTime: os($p(i.exp)),
			signInProvider: s || null,
			signInSecondFactor: o?.sign_in_second_factor || null,
		}
	})
}
function $p(e) {
	return Number(e) * 1e3
}
function ug(e) {
	let [t, n, r] = e.split('.')
	if (t === void 0 || n === void 0 || r === void 0)
		return _u('JWT malformed, contained fewer than 3 sections'), null
	try {
		let i = uu(n)
		return i ? JSON.parse(i) : (_u('Failed to decode base64 JWT payload'), null)
	} catch (i) {
		return _u('Caught error parsing JWT payload as JSON', i?.toString()), null
	}
}
function PD(e) {
	let t = ug(e)
	return (
		A(t, 'internal-error'),
		A(typeof t.exp < 'u', 'internal-error'),
		A(typeof t.iat < 'u', 'internal-error'),
		Number(t.exp) - Number(t.iat)
	)
}
function as(e, t, n = !1) {
	return p(this, null, function* () {
		if (n) return t
		try {
			return yield t
		} catch (r) {
			throw (
				(r instanceof dt &&
					CL(r) &&
					e.auth.currentUser === e &&
					(yield e.auth.signOut()),
				r)
			)
		}
	})
}
function CL({ code: e }) {
	return e === 'auth/user-disabled' || e === 'auth/user-token-expired'
}
var Gp = class {
	constructor(t) {
		;(this.user = t),
			(this.isRunning = !1),
			(this.timerId = null),
			(this.errorBackoff = 3e4)
	}
	_start() {
		this.isRunning || ((this.isRunning = !0), this.schedule())
	}
	_stop() {
		this.isRunning &&
			((this.isRunning = !1),
			this.timerId !== null && clearTimeout(this.timerId))
	}
	getInterval(t) {
		var n
		if (t) {
			let r = this.errorBackoff
			return (this.errorBackoff = Math.min(this.errorBackoff * 2, 96e4)), r
		} else {
			this.errorBackoff = 3e4
			let i =
				((n = this.user.stsTokenManager.expirationTime) !== null && n !== void 0
					? n
					: 0) -
				Date.now() -
				3e5
			return Math.max(0, i)
		}
	}
	schedule(t = !1) {
		if (!this.isRunning) return
		let n = this.getInterval(t)
		this.timerId = setTimeout(
			() =>
				p(this, null, function* () {
					yield this.iteration()
				}),
			n
		)
	}
	iteration() {
		return p(this, null, function* () {
			try {
				yield this.user.getIdToken(!0)
			} catch (t) {
				t?.code === 'auth/network-request-failed' && this.schedule(!0)
				return
			}
			this.schedule()
		})
	}
}
var cs = class {
	constructor(t, n) {
		;(this.createdAt = t), (this.lastLoginAt = n), this._initializeTime()
	}
	_initializeTime() {
		;(this.lastSignInTime = os(this.lastLoginAt)),
			(this.creationTime = os(this.createdAt))
	}
	_copy(t) {
		;(this.createdAt = t.createdAt),
			(this.lastLoginAt = t.lastLoginAt),
			this._initializeTime()
	}
	toJSON() {
		return { createdAt: this.createdAt, lastLoginAt: this.lastLoginAt }
	}
}
function Tu(e) {
	return p(this, null, function* () {
		var t
		let n = e.auth,
			r = yield e.getIdToken(),
			i = yield as(e, XD(n, { idToken: r }))
		A(i?.users.length, n, 'internal-error')
		let o = i.users[0]
		e._notifyReloadListener(o)
		let s =
				!((t = o.providerUserInfo) === null || t === void 0) && t.length
					? eb(o.providerUserInfo)
					: [],
			a = TL(e.providerData, s),
			c = e.isAnonymous,
			u = !(e.email && o.passwordHash) && !a?.length,
			l = c ? u : !1,
			d = {
				uid: o.localId,
				displayName: o.displayName || null,
				photoURL: o.photoUrl || null,
				email: o.email || null,
				emailVerified: o.emailVerified || !1,
				phoneNumber: o.phoneNumber || null,
				tenantId: o.tenantId || null,
				providerData: a,
				metadata: new cs(o.createdAt, o.lastLoginAt),
				isAnonymous: l,
			}
		Object.assign(e, d)
	})
}
function lg(e) {
	return p(this, null, function* () {
		let t = nn(e)
		yield Tu(t),
			yield t.auth._persistUserIfCurrent(t),
			t.auth._notifyListenersIfCurrent(t)
	})
}
function TL(e, t) {
	return [
		...e.filter((r) => !t.some((i) => i.providerId === r.providerId)),
		...t,
	]
}
function eb(e) {
	return e.map((t) => {
		var { providerId: n } = t,
			r = Rs(t, ['providerId'])
		return {
			providerId: n,
			uid: r.rawId || '',
			displayName: r.displayName || null,
			email: r.email || null,
			phoneNumber: r.phoneNumber || null,
			photoURL: r.photoUrl || null,
		}
	})
}
function SL(e, t) {
	return p(this, null, function* () {
		let n = yield QD(e, {}, () =>
			p(this, null, function* () {
				let r = Oi({ grant_type: 'refresh_token', refresh_token: t }).slice(1),
					{ tokenApiHost: i, apiKey: o } = e.config,
					s = JD(e, i, '/v1/token', `key=${o}`),
					a = yield e._getAdditionalHeaders()
				return (
					(a['Content-Type'] = 'application/x-www-form-urlencoded'),
					Cu.fetch()(s, { method: 'POST', headers: a, body: r })
				)
			})
		)
		return {
			accessToken: n.access_token,
			expiresIn: n.expires_in,
			refreshToken: n.refresh_token,
		}
	})
}
function AL(e, t) {
	return p(this, null, function* () {
		return ji(e, 'POST', '/v2/accounts:revokeToken', ag(e, t))
	})
}
var ss = class e {
	constructor() {
		;(this.refreshToken = null),
			(this.accessToken = null),
			(this.expirationTime = null)
	}
	get isExpired() {
		return !this.expirationTime || Date.now() > this.expirationTime - 3e4
	}
	updateFromServerResponse(t) {
		A(t.idToken, 'internal-error'),
			A(typeof t.idToken < 'u', 'internal-error'),
			A(typeof t.refreshToken < 'u', 'internal-error')
		let n =
			'expiresIn' in t && typeof t.expiresIn < 'u'
				? Number(t.expiresIn)
				: PD(t.idToken)
		this.updateTokensAndExpiration(t.idToken, t.refreshToken, n)
	}
	updateFromIdToken(t) {
		A(t.length !== 0, 'internal-error')
		let n = PD(t)
		this.updateTokensAndExpiration(t, null, n)
	}
	getToken(t, n = !1) {
		return p(this, null, function* () {
			return !n && this.accessToken && !this.isExpired
				? this.accessToken
				: (A(this.refreshToken, t, 'user-token-expired'),
				  this.refreshToken
						? (yield this.refresh(t, this.refreshToken), this.accessToken)
						: null)
		})
	}
	clearRefreshToken() {
		this.refreshToken = null
	}
	refresh(t, n) {
		return p(this, null, function* () {
			let { accessToken: r, refreshToken: i, expiresIn: o } = yield SL(t, n)
			this.updateTokensAndExpiration(r, i, Number(o))
		})
	}
	updateTokensAndExpiration(t, n, r) {
		;(this.refreshToken = n || null),
			(this.accessToken = t || null),
			(this.expirationTime = Date.now() + r * 1e3)
	}
	static fromJSON(t, n) {
		let { refreshToken: r, accessToken: i, expirationTime: o } = n,
			s = new e()
		return (
			r &&
				(A(typeof r == 'string', 'internal-error', { appName: t }),
				(s.refreshToken = r)),
			i &&
				(A(typeof i == 'string', 'internal-error', { appName: t }),
				(s.accessToken = i)),
			o &&
				(A(typeof o == 'number', 'internal-error', { appName: t }),
				(s.expirationTime = o)),
			s
		)
	}
	toJSON() {
		return {
			refreshToken: this.refreshToken,
			accessToken: this.accessToken,
			expirationTime: this.expirationTime,
		}
	}
	_assign(t) {
		;(this.accessToken = t.accessToken),
			(this.refreshToken = t.refreshToken),
			(this.expirationTime = t.expirationTime)
	}
	_clone() {
		return Object.assign(new e(), this.toJSON())
	}
	_performRefresh() {
		return sn('not implemented')
	}
}
function jn(e, t) {
	A(typeof e == 'string' || typeof e > 'u', 'internal-error', { appName: t })
}
var Vi = class e {
	constructor(t) {
		var { uid: n, auth: r, stsTokenManager: i } = t,
			o = Rs(t, ['uid', 'auth', 'stsTokenManager'])
		;(this.providerId = 'firebase'),
			(this.proactiveRefresh = new Gp(this)),
			(this.reloadUserInfo = null),
			(this.reloadListener = null),
			(this.uid = n),
			(this.auth = r),
			(this.stsTokenManager = i),
			(this.accessToken = i.accessToken),
			(this.displayName = o.displayName || null),
			(this.email = o.email || null),
			(this.emailVerified = o.emailVerified || !1),
			(this.phoneNumber = o.phoneNumber || null),
			(this.photoURL = o.photoURL || null),
			(this.isAnonymous = o.isAnonymous || !1),
			(this.tenantId = o.tenantId || null),
			(this.providerData = o.providerData ? [...o.providerData] : []),
			(this.metadata = new cs(o.createdAt || void 0, o.lastLoginAt || void 0))
	}
	getIdToken(t) {
		return p(this, null, function* () {
			let n = yield as(this, this.stsTokenManager.getToken(this.auth, t))
			return (
				A(n, this.auth, 'internal-error'),
				this.accessToken !== n &&
					((this.accessToken = n),
					yield this.auth._persistUserIfCurrent(this),
					this.auth._notifyListenersIfCurrent(this)),
				n
			)
		})
	}
	getIdTokenResult(t) {
		return cg(this, t)
	}
	reload() {
		return lg(this)
	}
	_assign(t) {
		this !== t &&
			(A(this.uid === t.uid, this.auth, 'internal-error'),
			(this.displayName = t.displayName),
			(this.photoURL = t.photoURL),
			(this.email = t.email),
			(this.emailVerified = t.emailVerified),
			(this.phoneNumber = t.phoneNumber),
			(this.isAnonymous = t.isAnonymous),
			(this.tenantId = t.tenantId),
			(this.providerData = t.providerData.map((n) => Object.assign({}, n))),
			this.metadata._copy(t.metadata),
			this.stsTokenManager._assign(t.stsTokenManager))
	}
	_clone(t) {
		let n = new e(
			Object.assign(Object.assign({}, this), {
				auth: t,
				stsTokenManager: this.stsTokenManager._clone(),
			})
		)
		return n.metadata._copy(this.metadata), n
	}
	_onReload(t) {
		A(!this.reloadListener, this.auth, 'internal-error'),
			(this.reloadListener = t),
			this.reloadUserInfo &&
				(this._notifyReloadListener(this.reloadUserInfo),
				(this.reloadUserInfo = null))
	}
	_notifyReloadListener(t) {
		this.reloadListener ? this.reloadListener(t) : (this.reloadUserInfo = t)
	}
	_startProactiveRefresh() {
		this.proactiveRefresh._start()
	}
	_stopProactiveRefresh() {
		this.proactiveRefresh._stop()
	}
	_updateTokensIfNecessary(t, n = !1) {
		return p(this, null, function* () {
			let r = !1
			t.idToken &&
				t.idToken !== this.stsTokenManager.accessToken &&
				(this.stsTokenManager.updateFromServerResponse(t), (r = !0)),
				n && (yield Tu(this)),
				yield this.auth._persistUserIfCurrent(this),
				r && this.auth._notifyListenersIfCurrent(this)
		})
	}
	delete() {
		return p(this, null, function* () {
			if (ht(this.auth.app)) return Promise.reject(yr(this.auth))
			let t = yield this.getIdToken()
			return (
				yield as(this, bL(this.auth, { idToken: t })),
				this.stsTokenManager.clearRefreshToken(),
				this.auth.signOut()
			)
		})
	}
	toJSON() {
		return Object.assign(
			Object.assign(
				{
					uid: this.uid,
					email: this.email || void 0,
					emailVerified: this.emailVerified,
					displayName: this.displayName || void 0,
					isAnonymous: this.isAnonymous,
					photoURL: this.photoURL || void 0,
					phoneNumber: this.phoneNumber || void 0,
					tenantId: this.tenantId || void 0,
					providerData: this.providerData.map((t) => Object.assign({}, t)),
					stsTokenManager: this.stsTokenManager.toJSON(),
					_redirectEventId: this._redirectEventId,
				},
				this.metadata.toJSON()
			),
			{ apiKey: this.auth.config.apiKey, appName: this.auth.name }
		)
	}
	get refreshToken() {
		return this.stsTokenManager.refreshToken || ''
	}
	static _fromJSON(t, n) {
		var r, i, o, s, a, c, u, l
		let d = (r = n.displayName) !== null && r !== void 0 ? r : void 0,
			h = (i = n.email) !== null && i !== void 0 ? i : void 0,
			f = (o = n.phoneNumber) !== null && o !== void 0 ? o : void 0,
			m = (s = n.photoURL) !== null && s !== void 0 ? s : void 0,
			v = (a = n.tenantId) !== null && a !== void 0 ? a : void 0,
			D = (c = n._redirectEventId) !== null && c !== void 0 ? c : void 0,
			T = (u = n.createdAt) !== null && u !== void 0 ? u : void 0,
			ce = (l = n.lastLoginAt) !== null && l !== void 0 ? l : void 0,
			{
				uid: W,
				emailVerified: mt,
				isAnonymous: vt,
				providerData: Vt,
				stsTokenManager: Ui,
			} = n
		A(W && Ui, t, 'internal-error')
		let Ab = ss.fromJSON(this.name, Ui)
		A(typeof W == 'string', t, 'internal-error'),
			jn(d, t.name),
			jn(h, t.name),
			A(typeof mt == 'boolean', t, 'internal-error'),
			A(typeof vt == 'boolean', t, 'internal-error'),
			jn(f, t.name),
			jn(m, t.name),
			jn(v, t.name),
			jn(D, t.name),
			jn(T, t.name),
			jn(ce, t.name)
		let Wu = new e({
			uid: W,
			auth: t,
			email: h,
			emailVerified: mt,
			displayName: d,
			isAnonymous: vt,
			photoURL: m,
			phoneNumber: f,
			tenantId: v,
			stsTokenManager: Ab,
			createdAt: T,
			lastLoginAt: ce,
		})
		return (
			Vt &&
				Array.isArray(Vt) &&
				(Wu.providerData = Vt.map((Mb) => Object.assign({}, Mb))),
			D && (Wu._redirectEventId = D),
			Wu
		)
	}
	static _fromIdTokenResponse(t, n, r = !1) {
		return p(this, null, function* () {
			let i = new ss()
			i.updateFromServerResponse(n)
			let o = new e({
				uid: n.localId,
				auth: t,
				stsTokenManager: i,
				isAnonymous: r,
			})
			return yield Tu(o), o
		})
	}
	static _fromGetAccountInfoResponse(t, n, r) {
		return p(this, null, function* () {
			let i = n.users[0]
			A(i.localId !== void 0, 'internal-error')
			let o = i.providerUserInfo !== void 0 ? eb(i.providerUserInfo) : [],
				s = !(i.email && i.passwordHash) && !o?.length,
				a = new ss()
			a.updateFromIdToken(r)
			let c = new e({
					uid: i.localId,
					auth: t,
					stsTokenManager: a,
					isAnonymous: s,
				}),
				u = {
					uid: i.localId,
					displayName: i.displayName || null,
					photoURL: i.photoUrl || null,
					email: i.email || null,
					emailVerified: i.emailVerified || !1,
					phoneNumber: i.phoneNumber || null,
					tenantId: i.tenantId || null,
					providerData: o,
					metadata: new cs(i.createdAt, i.lastLoginAt),
					isAnonymous: !(i.email && i.passwordHash) && !o?.length,
				}
			return Object.assign(c, u), c
		})
	}
}
var FD = new Map()
function an(e) {
	cn(e instanceof Function, 'Expected a class definition')
	let t = FD.get(e)
	return t
		? (cn(t instanceof e, 'Instance stored in cache mismatched with class'), t)
		: ((t = new e()), FD.set(e, t), t)
}
var ML = (() => {
		class e {
			constructor() {
				;(this.type = 'NONE'), (this.storage = {})
			}
			_isAvailable() {
				return p(this, null, function* () {
					return !0
				})
			}
			_set(n, r) {
				return p(this, null, function* () {
					this.storage[n] = r
				})
			}
			_get(n) {
				return p(this, null, function* () {
					let r = this.storage[n]
					return r === void 0 ? null : r
				})
			}
			_remove(n) {
				return p(this, null, function* () {
					delete this.storage[n]
				})
			}
			_addListener(n, r) {}
			_removeListener(n, r) {}
		}
		return (e.type = 'NONE'), e
	})(),
	qp = ML
function Iu(e, t, n) {
	return `firebase:${e}:${t}:${n}`
}
var Su = class e {
	constructor(t, n, r) {
		;(this.persistence = t), (this.auth = n), (this.userKey = r)
		let { config: i, name: o } = this.auth
		;(this.fullUserKey = Iu(this.userKey, i.apiKey, o)),
			(this.fullPersistenceKey = Iu('persistence', i.apiKey, o)),
			(this.boundEventHandler = n._onStorageEvent.bind(n)),
			this.persistence._addListener(this.fullUserKey, this.boundEventHandler)
	}
	setCurrentUser(t) {
		return this.persistence._set(this.fullUserKey, t.toJSON())
	}
	getCurrentUser() {
		return p(this, null, function* () {
			let t = yield this.persistence._get(this.fullUserKey)
			return t ? Vi._fromJSON(this.auth, t) : null
		})
	}
	removeCurrentUser() {
		return this.persistence._remove(this.fullUserKey)
	}
	savePersistenceForRedirect() {
		return this.persistence._set(this.fullPersistenceKey, this.persistence.type)
	}
	setPersistence(t) {
		return p(this, null, function* () {
			if (this.persistence === t) return
			let n = yield this.getCurrentUser()
			if ((yield this.removeCurrentUser(), (this.persistence = t), n))
				return this.setCurrentUser(n)
		})
	}
	delete() {
		this.persistence._removeListener(this.fullUserKey, this.boundEventHandler)
	}
	static create(t, n, r = 'authUser') {
		return p(this, null, function* () {
			if (!n.length) return new e(an(qp), t, r)
			let i = (yield Promise.all(
					n.map((u) =>
						p(this, null, function* () {
							if (yield u._isAvailable()) return u
						})
					)
				)).filter((u) => u),
				o = i[0] || an(qp),
				s = Iu(r, t.config.apiKey, t.name),
				a = null
			for (let u of n)
				try {
					let l = yield u._get(s)
					if (l) {
						let d = Vi._fromJSON(t, l)
						u !== o && (a = d), (o = u)
						break
					}
				} catch {}
			let c = i.filter((u) => u._shouldAllowMigration)
			return !o._shouldAllowMigration || !c.length
				? new e(o, t, r)
				: ((o = c[0]),
				  a && (yield o._set(s, a.toJSON())),
				  yield Promise.all(
						n.map((u) =>
							p(this, null, function* () {
								if (u !== o)
									try {
										yield u._remove(s)
									} catch {}
							})
						)
				  ),
				  new e(o, t, r))
		})
	}
}
function LD(e) {
	let t = e.toLowerCase()
	if (t.includes('opera/') || t.includes('opr/') || t.includes('opios/'))
		return 'Opera'
	if (ib(t)) return 'IEMobile'
	if (t.includes('msie') || t.includes('trident/')) return 'IE'
	if (t.includes('edge/')) return 'Edge'
	if (tb(t)) return 'Firefox'
	if (t.includes('silk/')) return 'Silk'
	if (sb(t)) return 'Blackberry'
	if (ab(t)) return 'Webos'
	if (nb(t)) return 'Safari'
	if ((t.includes('chrome/') || rb(t)) && !t.includes('edge/')) return 'Chrome'
	if (ob(t)) return 'Android'
	{
		let n = /([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/,
			r = e.match(n)
		if (r?.length === 2) return r[1]
	}
	return 'Other'
}
function tb(e = we()) {
	return /firefox\//i.test(e)
}
function nb(e = we()) {
	let t = e.toLowerCase()
	return (
		t.includes('safari/') &&
		!t.includes('chrome/') &&
		!t.includes('crios/') &&
		!t.includes('android')
	)
}
function rb(e = we()) {
	return /crios\//i.test(e)
}
function ib(e = we()) {
	return /iemobile/i.test(e)
}
function ob(e = we()) {
	return /android/i.test(e)
}
function sb(e = we()) {
	return /blackberry/i.test(e)
}
function ab(e = we()) {
	return /webos/i.test(e)
}
function dg(e = we()) {
	return (
		/iphone|ipad|ipod/i.test(e) || (/macintosh/i.test(e) && /mobile/i.test(e))
	)
}
function RL(e = we()) {
	var t
	return (
		dg(e) &&
		!!(!((t = window.navigator) === null || t === void 0) && t.standalone)
	)
}
function NL() {
	return nD() && document.documentMode === 10
}
function cb(e = we()) {
	return dg(e) || ob(e) || ab(e) || sb(e) || /windows phone/i.test(e) || ib(e)
}
function ub(e, t = []) {
	let n
	switch (e) {
		case 'Browser':
			n = LD(we())
			break
		case 'Worker':
			n = `${LD(we())}-${e}`
			break
		default:
			n = e
	}
	let r = t.length ? t.join(',') : 'FirebaseCore-web'
	return `${n}/JsCore/${ki}/${r}`
}
var Kp = class {
	constructor(t) {
		;(this.auth = t), (this.queue = [])
	}
	pushCallback(t, n) {
		let r = (o) =>
			new Promise((s, a) => {
				try {
					let c = t(o)
					s(c)
				} catch (c) {
					a(c)
				}
			})
		;(r.onAbort = n), this.queue.push(r)
		let i = this.queue.length - 1
		return () => {
			this.queue[i] = () => Promise.resolve()
		}
	}
	runMiddleware(t) {
		return p(this, null, function* () {
			if (this.auth.currentUser === t) return
			let n = []
			try {
				for (let r of this.queue) yield r(t), r.onAbort && n.push(r.onAbort)
			} catch (r) {
				n.reverse()
				for (let i of n)
					try {
						i()
					} catch {}
				throw this.auth._errorFactory.create('login-blocked', {
					originalMessage: r?.message,
				})
			}
		})
	}
}
function OL(n) {
	return p(this, arguments, function* (e, t = {}) {
		return ji(e, 'GET', '/v2/passwordPolicy', ag(e, t))
	})
}
var kL = 6,
	Yp = class {
		constructor(t) {
			var n, r, i, o
			let s = t.customStrengthOptions
			;(this.customStrengthOptions = {}),
				(this.customStrengthOptions.minPasswordLength =
					(n = s.minPasswordLength) !== null && n !== void 0 ? n : kL),
				s.maxPasswordLength &&
					(this.customStrengthOptions.maxPasswordLength = s.maxPasswordLength),
				s.containsLowercaseCharacter !== void 0 &&
					(this.customStrengthOptions.containsLowercaseLetter =
						s.containsLowercaseCharacter),
				s.containsUppercaseCharacter !== void 0 &&
					(this.customStrengthOptions.containsUppercaseLetter =
						s.containsUppercaseCharacter),
				s.containsNumericCharacter !== void 0 &&
					(this.customStrengthOptions.containsNumericCharacter =
						s.containsNumericCharacter),
				s.containsNonAlphanumericCharacter !== void 0 &&
					(this.customStrengthOptions.containsNonAlphanumericCharacter =
						s.containsNonAlphanumericCharacter),
				(this.enforcementState = t.enforcementState),
				this.enforcementState === 'ENFORCEMENT_STATE_UNSPECIFIED' &&
					(this.enforcementState = 'OFF'),
				(this.allowedNonAlphanumericCharacters =
					(i =
						(r = t.allowedNonAlphanumericCharacters) === null || r === void 0
							? void 0
							: r.join('')) !== null && i !== void 0
						? i
						: ''),
				(this.forceUpgradeOnSignin =
					(o = t.forceUpgradeOnSignin) !== null && o !== void 0 ? o : !1),
				(this.schemaVersion = t.schemaVersion)
		}
		validatePassword(t) {
			var n, r, i, o, s, a
			let c = { isValid: !0, passwordPolicy: this }
			return (
				this.validatePasswordLengthOptions(t, c),
				this.validatePasswordCharacterOptions(t, c),
				c.isValid &&
					(c.isValid =
						(n = c.meetsMinPasswordLength) !== null && n !== void 0 ? n : !0),
				c.isValid &&
					(c.isValid =
						(r = c.meetsMaxPasswordLength) !== null && r !== void 0 ? r : !0),
				c.isValid &&
					(c.isValid =
						(i = c.containsLowercaseLetter) !== null && i !== void 0 ? i : !0),
				c.isValid &&
					(c.isValid =
						(o = c.containsUppercaseLetter) !== null && o !== void 0 ? o : !0),
				c.isValid &&
					(c.isValid =
						(s = c.containsNumericCharacter) !== null && s !== void 0 ? s : !0),
				c.isValid &&
					(c.isValid =
						(a = c.containsNonAlphanumericCharacter) !== null && a !== void 0
							? a
							: !0),
				c
			)
		}
		validatePasswordLengthOptions(t, n) {
			let r = this.customStrengthOptions.minPasswordLength,
				i = this.customStrengthOptions.maxPasswordLength
			r && (n.meetsMinPasswordLength = t.length >= r),
				i && (n.meetsMaxPasswordLength = t.length <= i)
		}
		validatePasswordCharacterOptions(t, n) {
			this.updatePasswordCharacterOptionsStatuses(n, !1, !1, !1, !1)
			let r
			for (let i = 0; i < t.length; i++)
				(r = t.charAt(i)),
					this.updatePasswordCharacterOptionsStatuses(
						n,
						r >= 'a' && r <= 'z',
						r >= 'A' && r <= 'Z',
						r >= '0' && r <= '9',
						this.allowedNonAlphanumericCharacters.includes(r)
					)
		}
		updatePasswordCharacterOptionsStatuses(t, n, r, i, o) {
			this.customStrengthOptions.containsLowercaseLetter &&
				(t.containsLowercaseLetter || (t.containsLowercaseLetter = n)),
				this.customStrengthOptions.containsUppercaseLetter &&
					(t.containsUppercaseLetter || (t.containsUppercaseLetter = r)),
				this.customStrengthOptions.containsNumericCharacter &&
					(t.containsNumericCharacter || (t.containsNumericCharacter = i)),
				this.customStrengthOptions.containsNonAlphanumericCharacter &&
					(t.containsNonAlphanumericCharacter ||
						(t.containsNonAlphanumericCharacter = o))
		}
	}
var Zp = class {
	constructor(t, n, r, i) {
		;(this.app = t),
			(this.heartbeatServiceProvider = n),
			(this.appCheckServiceProvider = r),
			(this.config = i),
			(this.currentUser = null),
			(this.emulatorConfig = null),
			(this.operations = Promise.resolve()),
			(this.authStateSubscription = new Au(this)),
			(this.idTokenSubscription = new Au(this)),
			(this.beforeStateQueue = new Kp(this)),
			(this.redirectUser = null),
			(this.isProactiveRefreshEnabled = !1),
			(this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION = 1),
			(this._canInitEmulator = !0),
			(this._isInitialized = !1),
			(this._deleted = !1),
			(this._initializationPromise = null),
			(this._popupRedirectResolver = null),
			(this._errorFactory = ZD),
			(this._agentRecaptchaConfig = null),
			(this._tenantRecaptchaConfigs = {}),
			(this._projectPasswordPolicy = null),
			(this._tenantPasswordPolicies = {}),
			(this.lastNotifiedUid = void 0),
			(this.languageCode = null),
			(this.tenantId = null),
			(this.settings = { appVerificationDisabledForTesting: !1 }),
			(this.frameworks = []),
			(this.name = t.name),
			(this.clientVersion = i.sdkClientVersion)
	}
	_initializeWithPersistence(t, n) {
		return (
			n && (this._popupRedirectResolver = an(n)),
			(this._initializationPromise = this.queue(() =>
				p(this, null, function* () {
					var r, i
					if (
						!this._deleted &&
						((this.persistenceManager = yield Su.create(this, t)),
						!this._deleted)
					) {
						if (
							!((r = this._popupRedirectResolver) === null || r === void 0) &&
							r._shouldInitProactively
						)
							try {
								yield this._popupRedirectResolver._initialize(this)
							} catch {}
						yield this.initializeCurrentUser(n),
							(this.lastNotifiedUid =
								((i = this.currentUser) === null || i === void 0
									? void 0
									: i.uid) || null),
							!this._deleted && (this._isInitialized = !0)
					}
				})
			)),
			this._initializationPromise
		)
	}
	_onStorageEvent() {
		return p(this, null, function* () {
			if (this._deleted) return
			let t = yield this.assertedPersistence.getCurrentUser()
			if (!(!this.currentUser && !t)) {
				if (this.currentUser && t && this.currentUser.uid === t.uid) {
					this._currentUser._assign(t), yield this.currentUser.getIdToken()
					return
				}
				yield this._updateCurrentUser(t, !0)
			}
		})
	}
	initializeCurrentUserFromIdToken(t) {
		return p(this, null, function* () {
			try {
				let n = yield XD(this, { idToken: t }),
					r = yield Vi._fromGetAccountInfoResponse(this, n, t)
				yield this.directlySetCurrentUser(r)
			} catch (n) {
				console.warn(
					'FirebaseServerApp could not login user with provided authIdToken: ',
					n
				),
					yield this.directlySetCurrentUser(null)
			}
		})
	}
	initializeCurrentUser(t) {
		return p(this, null, function* () {
			var n
			if (ht(this.app)) {
				let s = this.app.settings.authIdToken
				return s
					? new Promise((a) => {
							setTimeout(() =>
								this.initializeCurrentUserFromIdToken(s).then(a, a)
							)
					  })
					: this.directlySetCurrentUser(null)
			}
			let r = yield this.assertedPersistence.getCurrentUser(),
				i = r,
				o = !1
			if (t && this.config.authDomain) {
				yield this.getOrInitRedirectPersistenceManager()
				let s =
						(n = this.redirectUser) === null || n === void 0
							? void 0
							: n._redirectEventId,
					a = i?._redirectEventId,
					c = yield this.tryRedirectSignIn(t)
				;(!s || s === a) && c?.user && ((i = c.user), (o = !0))
			}
			if (!i) return this.directlySetCurrentUser(null)
			if (!i._redirectEventId) {
				if (o)
					try {
						yield this.beforeStateQueue.runMiddleware(i)
					} catch (s) {
						;(i = r),
							this._popupRedirectResolver._overrideRedirectResult(this, () =>
								Promise.reject(s)
							)
					}
				return i
					? this.reloadAndSetCurrentUserOrClear(i)
					: this.directlySetCurrentUser(null)
			}
			return (
				A(this._popupRedirectResolver, this, 'argument-error'),
				yield this.getOrInitRedirectPersistenceManager(),
				this.redirectUser &&
				this.redirectUser._redirectEventId === i._redirectEventId
					? this.directlySetCurrentUser(i)
					: this.reloadAndSetCurrentUserOrClear(i)
			)
		})
	}
	tryRedirectSignIn(t) {
		return p(this, null, function* () {
			let n = null
			try {
				n = yield this._popupRedirectResolver._completeRedirectFn(this, t, !0)
			} catch {
				yield this._setRedirectUser(null)
			}
			return n
		})
	}
	reloadAndSetCurrentUserOrClear(t) {
		return p(this, null, function* () {
			try {
				yield Tu(t)
			} catch (n) {
				if (n?.code !== 'auth/network-request-failed')
					return this.directlySetCurrentUser(null)
			}
			return this.directlySetCurrentUser(t)
		})
	}
	useDeviceLanguage() {
		this.languageCode = _L()
	}
	_delete() {
		return p(this, null, function* () {
			this._deleted = !0
		})
	}
	updateCurrentUser(t) {
		return p(this, null, function* () {
			if (ht(this.app)) return Promise.reject(yr(this))
			let n = t ? nn(t) : null
			return (
				n &&
					A(
						n.auth.config.apiKey === this.config.apiKey,
						this,
						'invalid-user-token'
					),
				this._updateCurrentUser(n && n._clone(this))
			)
		})
	}
	_updateCurrentUser(t, n = !1) {
		return p(this, null, function* () {
			if (!this._deleted)
				return (
					t && A(this.tenantId === t.tenantId, this, 'tenant-id-mismatch'),
					n || (yield this.beforeStateQueue.runMiddleware(t)),
					this.queue(() =>
						p(this, null, function* () {
							yield this.directlySetCurrentUser(t), this.notifyAuthListeners()
						})
					)
				)
		})
	}
	signOut() {
		return p(this, null, function* () {
			return ht(this.app)
				? Promise.reject(yr(this))
				: (yield this.beforeStateQueue.runMiddleware(null),
				  (this.redirectPersistenceManager || this._popupRedirectResolver) &&
						(yield this._setRedirectUser(null)),
				  this._updateCurrentUser(null, !0))
		})
	}
	setPersistence(t) {
		return ht(this.app)
			? Promise.reject(yr(this))
			: this.queue(() =>
					p(this, null, function* () {
						yield this.assertedPersistence.setPersistence(an(t))
					})
			  )
	}
	_getRecaptchaConfig() {
		return this.tenantId == null
			? this._agentRecaptchaConfig
			: this._tenantRecaptchaConfigs[this.tenantId]
	}
	validatePassword(t) {
		return p(this, null, function* () {
			this._getPasswordPolicyInternal() || (yield this._updatePasswordPolicy())
			let n = this._getPasswordPolicyInternal()
			return n.schemaVersion !== this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION
				? Promise.reject(
						this._errorFactory.create(
							'unsupported-password-policy-schema-version',
							{}
						)
				  )
				: n.validatePassword(t)
		})
	}
	_getPasswordPolicyInternal() {
		return this.tenantId === null
			? this._projectPasswordPolicy
			: this._tenantPasswordPolicies[this.tenantId]
	}
	_updatePasswordPolicy() {
		return p(this, null, function* () {
			let t = yield OL(this),
				n = new Yp(t)
			this.tenantId === null
				? (this._projectPasswordPolicy = n)
				: (this._tenantPasswordPolicies[this.tenantId] = n)
		})
	}
	_getPersistence() {
		return this.assertedPersistence.persistence.type
	}
	_updateErrorMap(t) {
		this._errorFactory = new ft('auth', 'Firebase', t())
	}
	onAuthStateChanged(t, n, r) {
		return this.registerStateListener(this.authStateSubscription, t, n, r)
	}
	beforeAuthStateChanged(t, n) {
		return this.beforeStateQueue.pushCallback(t, n)
	}
	onIdTokenChanged(t, n, r) {
		return this.registerStateListener(this.idTokenSubscription, t, n, r)
	}
	authStateReady() {
		return new Promise((t, n) => {
			if (this.currentUser) t()
			else {
				let r = this.onAuthStateChanged(() => {
					r(), t()
				}, n)
			}
		})
	}
	revokeAccessToken(t) {
		return p(this, null, function* () {
			if (this.currentUser) {
				let n = yield this.currentUser.getIdToken(),
					r = {
						providerId: 'apple.com',
						tokenType: 'ACCESS_TOKEN',
						token: t,
						idToken: n,
					}
				this.tenantId != null && (r.tenantId = this.tenantId), yield AL(this, r)
			}
		})
	}
	toJSON() {
		var t
		return {
			apiKey: this.config.apiKey,
			authDomain: this.config.authDomain,
			appName: this.name,
			currentUser:
				(t = this._currentUser) === null || t === void 0 ? void 0 : t.toJSON(),
		}
	}
	_setRedirectUser(t, n) {
		return p(this, null, function* () {
			let r = yield this.getOrInitRedirectPersistenceManager(n)
			return t === null ? r.removeCurrentUser() : r.setCurrentUser(t)
		})
	}
	getOrInitRedirectPersistenceManager(t) {
		return p(this, null, function* () {
			if (!this.redirectPersistenceManager) {
				let n = (t && an(t)) || this._popupRedirectResolver
				A(n, this, 'argument-error'),
					(this.redirectPersistenceManager = yield Su.create(
						this,
						[an(n._redirectPersistence)],
						'redirectUser'
					)),
					(this.redirectUser =
						yield this.redirectPersistenceManager.getCurrentUser())
			}
			return this.redirectPersistenceManager
		})
	}
	_redirectUserForId(t) {
		return p(this, null, function* () {
			var n, r
			return (
				this._isInitialized &&
					(yield this.queue(() => p(this, null, function* () {}))),
				((n = this._currentUser) === null || n === void 0
					? void 0
					: n._redirectEventId) === t
					? this._currentUser
					: ((r = this.redirectUser) === null || r === void 0
							? void 0
							: r._redirectEventId) === t
					? this.redirectUser
					: null
			)
		})
	}
	_persistUserIfCurrent(t) {
		return p(this, null, function* () {
			if (t === this.currentUser)
				return this.queue(() =>
					p(this, null, function* () {
						return this.directlySetCurrentUser(t)
					})
				)
		})
	}
	_notifyListenersIfCurrent(t) {
		t === this.currentUser && this.notifyAuthListeners()
	}
	_key() {
		return `${this.config.authDomain}:${this.config.apiKey}:${this.name}`
	}
	_startProactiveRefresh() {
		;(this.isProactiveRefreshEnabled = !0),
			this.currentUser && this._currentUser._startProactiveRefresh()
	}
	_stopProactiveRefresh() {
		;(this.isProactiveRefreshEnabled = !1),
			this.currentUser && this._currentUser._stopProactiveRefresh()
	}
	get _currentUser() {
		return this.currentUser
	}
	notifyAuthListeners() {
		var t, n
		if (!this._isInitialized) return
		this.idTokenSubscription.next(this.currentUser)
		let r =
			(n = (t = this.currentUser) === null || t === void 0 ? void 0 : t.uid) !==
				null && n !== void 0
				? n
				: null
		this.lastNotifiedUid !== r &&
			((this.lastNotifiedUid = r),
			this.authStateSubscription.next(this.currentUser))
	}
	registerStateListener(t, n, r, i) {
		if (this._deleted) return () => {}
		let o = typeof n == 'function' ? n : n.next.bind(n),
			s = !1,
			a = this._isInitialized ? Promise.resolve() : this._initializationPromise
		if (
			(A(a, this, 'internal-error'),
			a.then(() => {
				s || o(this.currentUser)
			}),
			typeof n == 'function')
		) {
			let c = t.addObserver(n, r, i)
			return () => {
				;(s = !0), c()
			}
		} else {
			let c = t.addObserver(n)
			return () => {
				;(s = !0), c()
			}
		}
	}
	directlySetCurrentUser(t) {
		return p(this, null, function* () {
			this.currentUser &&
				this.currentUser !== t &&
				this._currentUser._stopProactiveRefresh(),
				t && this.isProactiveRefreshEnabled && t._startProactiveRefresh(),
				(this.currentUser = t),
				t
					? yield this.assertedPersistence.setCurrentUser(t)
					: yield this.assertedPersistence.removeCurrentUser()
		})
	}
	queue(t) {
		return (this.operations = this.operations.then(t, t)), this.operations
	}
	get assertedPersistence() {
		return (
			A(this.persistenceManager, this, 'internal-error'),
			this.persistenceManager
		)
	}
	_logFramework(t) {
		!t ||
			this.frameworks.includes(t) ||
			(this.frameworks.push(t),
			this.frameworks.sort(),
			(this.clientVersion = ub(
				this.config.clientPlatform,
				this._getFrameworks()
			)))
	}
	_getFrameworks() {
		return this.frameworks
	}
	_getAdditionalHeaders() {
		return p(this, null, function* () {
			var t
			let n = { 'X-Client-Version': this.clientVersion }
			this.app.options.appId && (n['X-Firebase-gmpid'] = this.app.options.appId)
			let r = yield (t = this.heartbeatServiceProvider.getImmediate({
				optional: !0,
			})) === null || t === void 0
				? void 0
				: t.getHeartbeatsHeader()
			r && (n['X-Firebase-Client'] = r)
			let i = yield this._getAppCheckToken()
			return i && (n['X-Firebase-AppCheck'] = i), n
		})
	}
	_getAppCheckToken() {
		return p(this, null, function* () {
			var t
			if (ht(this.app) && this.app.settings.appCheckToken)
				return this.app.settings.appCheckToken
			let n = yield (t = this.appCheckServiceProvider.getImmediate({
				optional: !0,
			})) === null || t === void 0
				? void 0
				: t.getToken()
			return (
				n?.error && mL(`Error while retrieving App Check token: ${n.error}`),
				n?.token
			)
		})
	}
}
function Fu(e) {
	return nn(e)
}
var Au = class {
	constructor(t) {
		;(this.auth = t),
			(this.observer = null),
			(this.addObserver = oD((n) => (this.observer = n)))
	}
	get next() {
		return (
			A(this.observer, this.auth, 'internal-error'),
			this.observer.next.bind(this.observer)
		)
	}
}
var fg = {
	loadJS() {
		return p(this, null, function* () {
			throw new Error('Unable to load external scripts')
		})
	},
	recaptchaV2Script: '',
	recaptchaEnterpriseScript: '',
	gapiScript: '',
}
function xL(e) {
	fg = e
}
function PL(e) {
	return fg.loadJS(e)
}
function FL() {
	return fg.gapiScript
}
function lb(e) {
	return `__${e}${Math.floor(Math.random() * 1e6)}`
}
function hg(e, t) {
	let n = hu(e, 'auth')
	if (n.isInitialized()) {
		let i = n.getImmediate(),
			o = n.getOptions()
		if (Pn(o, t ?? {})) return i
		Ft(i, 'already-initialized')
	}
	return n.initialize({ options: t })
}
function LL(e, t) {
	let n = t?.persistence || [],
		r = (Array.isArray(n) ? n : [n]).map(an)
	t?.errorMap && e._updateErrorMap(t.errorMap),
		e._initializeWithPersistence(r, t?.popupRedirectResolver)
}
function pg(e, t, n) {
	let r = Fu(e)
	A(/^https?:\/\//.test(t), r, 'invalid-emulator-scheme')
	let i = !!n?.disableWarnings,
		o = db(t),
		{ host: s, port: a } = VL(t),
		c = a === null ? '' : `:${a}`,
		u = { url: `${o}//${s}${c}/` },
		l = Object.freeze({
			host: s,
			port: a,
			protocol: o.replace(':', ''),
			options: Object.freeze({ disableWarnings: i }),
		})
	if (!r._canInitEmulator) {
		A(r.config.emulator && r.emulatorConfig, r, 'emulator-config-failed'),
			A(
				Pn(u, r.config.emulator) && Pn(l, r.emulatorConfig),
				r,
				'emulator-config-failed'
			)
		return
	}
	;(r.config.emulator = u),
		(r.emulatorConfig = l),
		(r.settings.appVerificationDisabledForTesting = !0),
		i || jL()
}
function db(e) {
	let t = e.indexOf(':')
	return t < 0 ? '' : e.substr(0, t + 1)
}
function VL(e) {
	let t = db(e),
		n = /(\/\/)?([^?#/]+)/.exec(e.substr(t.length))
	if (!n) return { host: '', port: null }
	let r = n[2].split('@').pop() || '',
		i = /^(\[[^\]]+\])(:|$)/.exec(r)
	if (i) {
		let o = i[1]
		return { host: o, port: VD(r.substr(o.length + 1)) }
	} else {
		let [o, s] = r.split(':')
		return { host: o, port: VD(s) }
	}
}
function VD(e) {
	if (!e) return null
	let t = Number(e)
	return isNaN(t) ? null : t
}
function jL() {
	function e() {
		let t = document.createElement('p'),
			n = t.style
		;(t.innerText =
			'Running in emulator mode. Do not use with production credentials.'),
			(n.position = 'fixed'),
			(n.width = '100%'),
			(n.backgroundColor = '#ffffff'),
			(n.border = '.1em solid #000000'),
			(n.color = '#b50000'),
			(n.bottom = '0px'),
			(n.left = '0px'),
			(n.margin = '0px'),
			(n.zIndex = '10000'),
			(n.textAlign = 'center'),
			t.classList.add('firebase-emulator-warning'),
			document.body.appendChild(t)
	}
	typeof console < 'u' &&
		typeof console.info == 'function' &&
		console.info(
			'WARNING: You are using the Auth Emulator, which is intended for local testing only.  Do not use with production credentials.'
		),
		typeof window < 'u' &&
			typeof document < 'u' &&
			(document.readyState === 'loading'
				? window.addEventListener('DOMContentLoaded', e)
				: e())
}
var us = class {
	constructor(t, n) {
		;(this.providerId = t), (this.signInMethod = n)
	}
	toJSON() {
		return sn('not implemented')
	}
	_getIdTokenResponse(t) {
		return sn('not implemented')
	}
	_linkToIdToken(t, n) {
		return sn('not implemented')
	}
	_getReauthenticationResolver(t) {
		return sn('not implemented')
	}
}
function Li(e, t) {
	return p(this, null, function* () {
		return DL(e, 'POST', '/v1/accounts:signInWithIdp', ag(e, t))
	})
}
var UL = 'http://localhost',
	Mu = class e extends us {
		constructor() {
			super(...arguments), (this.pendingToken = null)
		}
		static _fromParams(t) {
			let n = new e(t.providerId, t.signInMethod)
			return (
				t.idToken || t.accessToken
					? (t.idToken && (n.idToken = t.idToken),
					  t.accessToken && (n.accessToken = t.accessToken),
					  t.nonce && !t.pendingToken && (n.nonce = t.nonce),
					  t.pendingToken && (n.pendingToken = t.pendingToken))
					: t.oauthToken && t.oauthTokenSecret
					? ((n.accessToken = t.oauthToken), (n.secret = t.oauthTokenSecret))
					: Ft('argument-error'),
				n
			)
		}
		toJSON() {
			return {
				idToken: this.idToken,
				accessToken: this.accessToken,
				secret: this.secret,
				nonce: this.nonce,
				pendingToken: this.pendingToken,
				providerId: this.providerId,
				signInMethod: this.signInMethod,
			}
		}
		static fromJSON(t) {
			let n = typeof t == 'string' ? JSON.parse(t) : t,
				{ providerId: r, signInMethod: i } = n,
				o = Rs(n, ['providerId', 'signInMethod'])
			if (!r || !i) return null
			let s = new e(r, i)
			return (
				(s.idToken = o.idToken || void 0),
				(s.accessToken = o.accessToken || void 0),
				(s.secret = o.secret),
				(s.nonce = o.nonce),
				(s.pendingToken = o.pendingToken || null),
				s
			)
		}
		_getIdTokenResponse(t) {
			let n = this.buildRequest()
			return Li(t, n)
		}
		_linkToIdToken(t, n) {
			let r = this.buildRequest()
			return (r.idToken = n), Li(t, r)
		}
		_getReauthenticationResolver(t) {
			let n = this.buildRequest()
			return (n.autoCreate = !1), Li(t, n)
		}
		buildRequest() {
			let t = { requestUri: UL, returnSecureToken: !0 }
			if (this.pendingToken) t.pendingToken = this.pendingToken
			else {
				let n = {}
				this.idToken && (n.id_token = this.idToken),
					this.accessToken && (n.access_token = this.accessToken),
					this.secret && (n.oauth_token_secret = this.secret),
					(n.providerId = this.providerId),
					this.nonce && !this.pendingToken && (n.nonce = this.nonce),
					(t.postBody = Oi(n))
			}
			return t
		}
	}
var ls = class {
	constructor(t) {
		;(this.providerId = t),
			(this.defaultLanguageCode = null),
			(this.customParameters = {})
	}
	setDefaultLanguage(t) {
		this.defaultLanguageCode = t
	}
	setCustomParameters(t) {
		return (this.customParameters = t), this
	}
	getCustomParameters() {
		return this.customParameters
	}
}
var Ru = class extends ls {
	constructor() {
		super(...arguments), (this.scopes = [])
	}
	addScope(t) {
		return this.scopes.includes(t) || this.scopes.push(t), this
	}
	getScopes() {
		return [...this.scopes]
	}
}
var gg = (() => {
	class e extends Ru {
		constructor() {
			super('google.com'), this.addScope('profile')
		}
		static credential(n, r) {
			return Mu._fromParams({
				providerId: e.PROVIDER_ID,
				signInMethod: e.GOOGLE_SIGN_IN_METHOD,
				idToken: n,
				accessToken: r,
			})
		}
		static credentialFromResult(n) {
			return e.credentialFromTaggedObject(n)
		}
		static credentialFromError(n) {
			return e.credentialFromTaggedObject(n.customData || {})
		}
		static credentialFromTaggedObject({ _tokenResponse: n }) {
			if (!n) return null
			let { oauthIdToken: r, oauthAccessToken: i } = n
			if (!r && !i) return null
			try {
				return e.credential(r, i)
			} catch {
				return null
			}
		}
	}
	;(e.GOOGLE_SIGN_IN_METHOD = 'google.com'), (e.PROVIDER_ID = 'google.com')
	return e
})()
var ds = class e {
	constructor(t) {
		;(this.user = t.user),
			(this.providerId = t.providerId),
			(this._tokenResponse = t._tokenResponse),
			(this.operationType = t.operationType)
	}
	static _fromIdTokenResponse(t, n, r, i = !1) {
		return p(this, null, function* () {
			let o = yield Vi._fromIdTokenResponse(t, r, i),
				s = jD(r)
			return new e({
				user: o,
				providerId: s,
				_tokenResponse: r,
				operationType: n,
			})
		})
	}
	static _forOperation(t, n, r) {
		return p(this, null, function* () {
			yield t._updateTokensIfNecessary(r, !0)
			let i = jD(r)
			return new e({
				user: t,
				providerId: i,
				_tokenResponse: r,
				operationType: n,
			})
		})
	}
}
function jD(e) {
	return e.providerId ? e.providerId : 'phoneNumber' in e ? 'phone' : null
}
var Qp = class e extends dt {
	constructor(t, n, r, i) {
		var o
		super(n.code, n.message),
			(this.operationType = r),
			(this.user = i),
			Object.setPrototypeOf(this, e.prototype),
			(this.customData = {
				appName: t.name,
				tenantId: (o = t.tenantId) !== null && o !== void 0 ? o : void 0,
				_serverResponse: n.customData._serverResponse,
				operationType: r,
			})
	}
	static _fromErrorAndOperation(t, n, r, i) {
		return new e(t, n, r, i)
	}
}
function fb(e, t, n, r) {
	return (
		t === 'reauthenticate'
			? n._getReauthenticationResolver(e)
			: n._getIdTokenResponse(e)
	).catch((o) => {
		throw o.code === 'auth/multi-factor-auth-required'
			? Qp._fromErrorAndOperation(e, o, t, r)
			: o
	})
}
function BL(e, t, n = !1) {
	return p(this, null, function* () {
		let r = yield as(e, t._linkToIdToken(e.auth, yield e.getIdToken()), n)
		return ds._forOperation(e, 'link', r)
	})
}
function $L(e, t, n = !1) {
	return p(this, null, function* () {
		let { auth: r } = e
		if (ht(r.app)) return Promise.reject(yr(r))
		let i = 'reauthenticate'
		try {
			let o = yield as(e, fb(r, i, t, e), n)
			A(o.idToken, r, 'internal-error')
			let s = ug(o.idToken)
			A(s, r, 'internal-error')
			let { sub: a } = s
			return A(e.uid === a, r, 'user-mismatch'), ds._forOperation(e, i, o)
		} catch (o) {
			throw (o?.code === 'auth/user-not-found' && Ft(r, 'user-mismatch'), o)
		}
	})
}
function HL(e, t, n = !1) {
	return p(this, null, function* () {
		if (ht(e.app)) return Promise.reject(yr(e))
		let r = 'signIn',
			i = yield fb(e, r, t),
			o = yield ds._fromIdTokenResponse(e, r, i)
		return n || (yield e._updateCurrentUser(o.user)), o
	})
}
function mg(e, t, n, r) {
	return nn(e).onIdTokenChanged(t, n, r)
}
function vg(e, t, n) {
	return nn(e).beforeAuthStateChanged(t, n)
}
function yg(e) {
	return nn(e).signOut()
}
var Nu = '__sak'
var Ou = class {
	constructor(t, n) {
		;(this.storageRetriever = t), (this.type = n)
	}
	_isAvailable() {
		try {
			return this.storage
				? (this.storage.setItem(Nu, '1'),
				  this.storage.removeItem(Nu),
				  Promise.resolve(!0))
				: Promise.resolve(!1)
		} catch {
			return Promise.resolve(!1)
		}
	}
	_set(t, n) {
		return this.storage.setItem(t, JSON.stringify(n)), Promise.resolve()
	}
	_get(t) {
		let n = this.storage.getItem(t)
		return Promise.resolve(n ? JSON.parse(n) : null)
	}
	_remove(t) {
		return this.storage.removeItem(t), Promise.resolve()
	}
	get storage() {
		return this.storageRetriever()
	}
}
var zL = 1e3,
	WL = 10,
	GL = (() => {
		class e extends Ou {
			constructor() {
				super(() => window.localStorage, 'LOCAL'),
					(this.boundEventHandler = (n, r) => this.onStorageEvent(n, r)),
					(this.listeners = {}),
					(this.localCache = {}),
					(this.pollTimer = null),
					(this.fallbackToPolling = cb()),
					(this._shouldAllowMigration = !0)
			}
			forAllChangedKeys(n) {
				for (let r of Object.keys(this.listeners)) {
					let i = this.storage.getItem(r),
						o = this.localCache[r]
					i !== o && n(r, o, i)
				}
			}
			onStorageEvent(n, r = !1) {
				if (!n.key) {
					this.forAllChangedKeys((a, c, u) => {
						this.notifyListeners(a, u)
					})
					return
				}
				let i = n.key
				r ? this.detachListener() : this.stopPolling()
				let o = () => {
						let a = this.storage.getItem(i)
						;(!r && this.localCache[i] === a) || this.notifyListeners(i, a)
					},
					s = this.storage.getItem(i)
				NL() && s !== n.newValue && n.newValue !== n.oldValue
					? setTimeout(o, WL)
					: o()
			}
			notifyListeners(n, r) {
				this.localCache[n] = r
				let i = this.listeners[n]
				if (i) for (let o of Array.from(i)) o(r && JSON.parse(r))
			}
			startPolling() {
				this.stopPolling(),
					(this.pollTimer = setInterval(() => {
						this.forAllChangedKeys((n, r, i) => {
							this.onStorageEvent(
								new StorageEvent('storage', {
									key: n,
									oldValue: r,
									newValue: i,
								}),
								!0
							)
						})
					}, zL))
			}
			stopPolling() {
				this.pollTimer &&
					(clearInterval(this.pollTimer), (this.pollTimer = null))
			}
			attachListener() {
				window.addEventListener('storage', this.boundEventHandler)
			}
			detachListener() {
				window.removeEventListener('storage', this.boundEventHandler)
			}
			_addListener(n, r) {
				Object.keys(this.listeners).length === 0 &&
					(this.fallbackToPolling
						? this.startPolling()
						: this.attachListener()),
					this.listeners[n] ||
						((this.listeners[n] = new Set()),
						(this.localCache[n] = this.storage.getItem(n))),
					this.listeners[n].add(r)
			}
			_removeListener(n, r) {
				this.listeners[n] &&
					(this.listeners[n].delete(r),
					this.listeners[n].size === 0 && delete this.listeners[n]),
					Object.keys(this.listeners).length === 0 &&
						(this.detachListener(), this.stopPolling())
			}
			_set(n, r) {
				return p(this, null, function* () {
					yield Un(e.prototype, this, '_set').call(this, n, r),
						(this.localCache[n] = JSON.stringify(r))
				})
			}
			_get(n) {
				return p(this, null, function* () {
					let r = yield Un(e.prototype, this, '_get').call(this, n)
					return (this.localCache[n] = JSON.stringify(r)), r
				})
			}
			_remove(n) {
				return p(this, null, function* () {
					yield Un(e.prototype, this, '_remove').call(this, n),
						delete this.localCache[n]
				})
			}
		}
		return (e.type = 'LOCAL'), e
	})(),
	hb = GL
var qL = (() => {
		class e extends Ou {
			constructor() {
				super(() => window.sessionStorage, 'SESSION')
			}
			_addListener(n, r) {}
			_removeListener(n, r) {}
		}
		return (e.type = 'SESSION'), e
	})(),
	Eg = qL
function KL(e) {
	return Promise.all(
		e.map((t) =>
			p(this, null, function* () {
				try {
					return { fulfilled: !0, value: yield t }
				} catch (n) {
					return { fulfilled: !1, reason: n }
				}
			})
		)
	)
}
var YL = (() => {
	class e {
		constructor(n) {
			;(this.eventTarget = n),
				(this.handlersMap = {}),
				(this.boundEventHandler = this.handleEvent.bind(this))
		}
		static _getInstance(n) {
			let r = this.receivers.find((o) => o.isListeningto(n))
			if (r) return r
			let i = new e(n)
			return this.receivers.push(i), i
		}
		isListeningto(n) {
			return this.eventTarget === n
		}
		handleEvent(n) {
			return p(this, null, function* () {
				let r = n,
					{ eventId: i, eventType: o, data: s } = r.data,
					a = this.handlersMap[o]
				if (!a?.size) return
				r.ports[0].postMessage({ status: 'ack', eventId: i, eventType: o })
				let c = Array.from(a).map((l) =>
						p(this, null, function* () {
							return l(r.origin, s)
						})
					),
					u = yield KL(c)
				r.ports[0].postMessage({
					status: 'done',
					eventId: i,
					eventType: o,
					response: u,
				})
			})
		}
		_subscribe(n, r) {
			Object.keys(this.handlersMap).length === 0 &&
				this.eventTarget.addEventListener('message', this.boundEventHandler),
				this.handlersMap[n] || (this.handlersMap[n] = new Set()),
				this.handlersMap[n].add(r)
		}
		_unsubscribe(n, r) {
			this.handlersMap[n] && r && this.handlersMap[n].delete(r),
				(!r || this.handlersMap[n].size === 0) && delete this.handlersMap[n],
				Object.keys(this.handlersMap).length === 0 &&
					this.eventTarget.removeEventListener(
						'message',
						this.boundEventHandler
					)
		}
	}
	e.receivers = []
	return e
})()
function _g(e = '', t = 10) {
	let n = ''
	for (let r = 0; r < t; r++) n += Math.floor(Math.random() * 10)
	return e + n
}
var Jp = class {
	constructor(t) {
		;(this.target = t), (this.handlers = new Set())
	}
	removeMessageHandler(t) {
		t.messageChannel &&
			(t.messageChannel.port1.removeEventListener('message', t.onMessage),
			t.messageChannel.port1.close()),
			this.handlers.delete(t)
	}
	_send(t, n, r = 50) {
		return p(this, null, function* () {
			let i = typeof MessageChannel < 'u' ? new MessageChannel() : null
			if (!i) throw new Error('connection_unavailable')
			let o, s
			return new Promise((a, c) => {
				let u = _g('', 20)
				i.port1.start()
				let l = setTimeout(() => {
					c(new Error('unsupported_event'))
				}, r)
				;(s = {
					messageChannel: i,
					onMessage(d) {
						let h = d
						if (h.data.eventId === u)
							switch (h.data.status) {
								case 'ack':
									clearTimeout(l),
										(o = setTimeout(() => {
											c(new Error('timeout'))
										}, 3e3))
									break
								case 'done':
									clearTimeout(o), a(h.data.response)
									break
								default:
									clearTimeout(l),
										clearTimeout(o),
										c(new Error('invalid_response'))
									break
							}
					},
				}),
					this.handlers.add(s),
					i.port1.addEventListener('message', s.onMessage),
					this.target.postMessage({ eventType: t, eventId: u, data: n }, [
						i.port2,
					])
			}).finally(() => {
				s && this.removeMessageHandler(s)
			})
		})
	}
}
function Pt() {
	return window
}
function ZL(e) {
	Pt().location.href = e
}
function pb() {
	return (
		typeof Pt().WorkerGlobalScope < 'u' &&
		typeof Pt().importScripts == 'function'
	)
}
function QL() {
	return p(this, null, function* () {
		if (!navigator?.serviceWorker) return null
		try {
			return (yield navigator.serviceWorker.ready).active
		} catch {
			return null
		}
	})
}
function JL() {
	var e
	return (
		((e = navigator?.serviceWorker) === null || e === void 0
			? void 0
			: e.controller) || null
	)
}
function XL() {
	return pb() ? self : null
}
var gb = 'firebaseLocalStorageDb',
	e1 = 1,
	ku = 'firebaseLocalStorage',
	mb = 'fbase_key',
	_r = class {
		constructor(t) {
			this.request = t
		}
		toPromise() {
			return new Promise((t, n) => {
				this.request.addEventListener('success', () => {
					t(this.request.result)
				}),
					this.request.addEventListener('error', () => {
						n(this.request.error)
					})
			})
		}
	}
function Lu(e, t) {
	return e.transaction([ku], t ? 'readwrite' : 'readonly').objectStore(ku)
}
function t1() {
	let e = indexedDB.deleteDatabase(gb)
	return new _r(e).toPromise()
}
function Xp() {
	let e = indexedDB.open(gb, e1)
	return new Promise((t, n) => {
		e.addEventListener('error', () => {
			n(e.error)
		}),
			e.addEventListener('upgradeneeded', () => {
				let r = e.result
				try {
					r.createObjectStore(ku, { keyPath: mb })
				} catch (i) {
					n(i)
				}
			}),
			e.addEventListener('success', () =>
				p(this, null, function* () {
					let r = e.result
					r.objectStoreNames.contains(ku)
						? t(r)
						: (r.close(), yield t1(), t(yield Xp()))
				})
			)
	})
}
function UD(e, t, n) {
	return p(this, null, function* () {
		let r = Lu(e, !0).put({ [mb]: t, value: n })
		return new _r(r).toPromise()
	})
}
function n1(e, t) {
	return p(this, null, function* () {
		let n = Lu(e, !1).get(t),
			r = yield new _r(n).toPromise()
		return r === void 0 ? null : r.value
	})
}
function BD(e, t) {
	let n = Lu(e, !0).delete(t)
	return new _r(n).toPromise()
}
var r1 = 800,
	i1 = 3,
	o1 = (() => {
		class e {
			constructor() {
				;(this.type = 'LOCAL'),
					(this._shouldAllowMigration = !0),
					(this.listeners = {}),
					(this.localCache = {}),
					(this.pollTimer = null),
					(this.pendingWrites = 0),
					(this.receiver = null),
					(this.sender = null),
					(this.serviceWorkerReceiverAvailable = !1),
					(this.activeServiceWorker = null),
					(this._workerInitializationPromise =
						this.initializeServiceWorkerMessaging().then(
							() => {},
							() => {}
						))
			}
			_openDb() {
				return p(this, null, function* () {
					return this.db ? this.db : ((this.db = yield Xp()), this.db)
				})
			}
			_withRetries(n) {
				return p(this, null, function* () {
					let r = 0
					for (;;)
						try {
							let i = yield this._openDb()
							return yield n(i)
						} catch (i) {
							if (r++ > i1) throw i
							this.db && (this.db.close(), (this.db = void 0))
						}
				})
			}
			initializeServiceWorkerMessaging() {
				return p(this, null, function* () {
					return pb() ? this.initializeReceiver() : this.initializeSender()
				})
			}
			initializeReceiver() {
				return p(this, null, function* () {
					;(this.receiver = YL._getInstance(XL())),
						this.receiver._subscribe('keyChanged', (n, r) =>
							p(this, null, function* () {
								return { keyProcessed: (yield this._poll()).includes(r.key) }
							})
						),
						this.receiver._subscribe('ping', (n, r) =>
							p(this, null, function* () {
								return ['keyChanged']
							})
						)
				})
			}
			initializeSender() {
				return p(this, null, function* () {
					var n, r
					if (
						((this.activeServiceWorker = yield QL()), !this.activeServiceWorker)
					)
						return
					this.sender = new Jp(this.activeServiceWorker)
					let i = yield this.sender._send('ping', {}, 800)
					i &&
						!((n = i[0]) === null || n === void 0) &&
						n.fulfilled &&
						!((r = i[0]) === null || r === void 0) &&
						r.value.includes('keyChanged') &&
						(this.serviceWorkerReceiverAvailable = !0)
				})
			}
			notifyServiceWorker(n) {
				return p(this, null, function* () {
					if (
						!(
							!this.sender ||
							!this.activeServiceWorker ||
							JL() !== this.activeServiceWorker
						)
					)
						try {
							yield this.sender._send(
								'keyChanged',
								{ key: n },
								this.serviceWorkerReceiverAvailable ? 800 : 50
							)
						} catch {}
				})
			}
			_isAvailable() {
				return p(this, null, function* () {
					try {
						if (!indexedDB) return !1
						let n = yield Xp()
						return yield UD(n, Nu, '1'), yield BD(n, Nu), !0
					} catch {}
					return !1
				})
			}
			_withPendingWrite(n) {
				return p(this, null, function* () {
					this.pendingWrites++
					try {
						yield n()
					} finally {
						this.pendingWrites--
					}
				})
			}
			_set(n, r) {
				return p(this, null, function* () {
					return this._withPendingWrite(() =>
						p(this, null, function* () {
							return (
								yield this._withRetries((i) => UD(i, n, r)),
								(this.localCache[n] = r),
								this.notifyServiceWorker(n)
							)
						})
					)
				})
			}
			_get(n) {
				return p(this, null, function* () {
					let r = yield this._withRetries((i) => n1(i, n))
					return (this.localCache[n] = r), r
				})
			}
			_remove(n) {
				return p(this, null, function* () {
					return this._withPendingWrite(() =>
						p(this, null, function* () {
							return (
								yield this._withRetries((r) => BD(r, n)),
								delete this.localCache[n],
								this.notifyServiceWorker(n)
							)
						})
					)
				})
			}
			_poll() {
				return p(this, null, function* () {
					let n = yield this._withRetries((o) => {
						let s = Lu(o, !1).getAll()
						return new _r(s).toPromise()
					})
					if (!n) return []
					if (this.pendingWrites !== 0) return []
					let r = [],
						i = new Set()
					if (n.length !== 0)
						for (let { fbase_key: o, value: s } of n)
							i.add(o),
								JSON.stringify(this.localCache[o]) !== JSON.stringify(s) &&
									(this.notifyListeners(o, s), r.push(o))
					for (let o of Object.keys(this.localCache))
						this.localCache[o] &&
							!i.has(o) &&
							(this.notifyListeners(o, null), r.push(o))
					return r
				})
			}
			notifyListeners(n, r) {
				this.localCache[n] = r
				let i = this.listeners[n]
				if (i) for (let o of Array.from(i)) o(r)
			}
			startPolling() {
				this.stopPolling(),
					(this.pollTimer = setInterval(
						() =>
							p(this, null, function* () {
								return this._poll()
							}),
						r1
					))
			}
			stopPolling() {
				this.pollTimer &&
					(clearInterval(this.pollTimer), (this.pollTimer = null))
			}
			_addListener(n, r) {
				Object.keys(this.listeners).length === 0 && this.startPolling(),
					this.listeners[n] || ((this.listeners[n] = new Set()), this._get(n)),
					this.listeners[n].add(r)
			}
			_removeListener(n, r) {
				this.listeners[n] &&
					(this.listeners[n].delete(r),
					this.listeners[n].size === 0 && delete this.listeners[n]),
					Object.keys(this.listeners).length === 0 && this.stopPolling()
			}
		}
		return (e.type = 'LOCAL'), e
	})(),
	vb = o1
var aq = lb('rcb'),
	cq = new Er(3e4, 6e4)
function yb(e, t) {
	return t
		? an(t)
		: (A(e._popupRedirectResolver, e, 'argument-error'),
		  e._popupRedirectResolver)
}
var fs = class extends us {
	constructor(t) {
		super('custom', 'custom'), (this.params = t)
	}
	_getIdTokenResponse(t) {
		return Li(t, this._buildIdpRequest())
	}
	_linkToIdToken(t, n) {
		return Li(t, this._buildIdpRequest(n))
	}
	_getReauthenticationResolver(t) {
		return Li(t, this._buildIdpRequest())
	}
	_buildIdpRequest(t) {
		let n = {
			requestUri: this.params.requestUri,
			sessionId: this.params.sessionId,
			postBody: this.params.postBody,
			tenantId: this.params.tenantId,
			pendingToken: this.params.pendingToken,
			returnSecureToken: !0,
			returnIdpCredential: !0,
		}
		return t && (n.idToken = t), n
	}
}
function s1(e) {
	return HL(e.auth, new fs(e), e.bypassAuthState)
}
function a1(e) {
	let { auth: t, user: n } = e
	return A(n, t, 'internal-error'), $L(n, new fs(e), e.bypassAuthState)
}
function c1(e) {
	return p(this, null, function* () {
		let { auth: t, user: n } = e
		return A(n, t, 'internal-error'), BL(n, new fs(e), e.bypassAuthState)
	})
}
var xu = class {
	constructor(t, n, r, i, o = !1) {
		;(this.auth = t),
			(this.resolver = r),
			(this.user = i),
			(this.bypassAuthState = o),
			(this.pendingPromise = null),
			(this.eventManager = null),
			(this.filter = Array.isArray(n) ? n : [n])
	}
	execute() {
		return new Promise((t, n) =>
			p(this, null, function* () {
				this.pendingPromise = { resolve: t, reject: n }
				try {
					;(this.eventManager = yield this.resolver._initialize(this.auth)),
						yield this.onExecution(),
						this.eventManager.registerConsumer(this)
				} catch (r) {
					this.reject(r)
				}
			})
		)
	}
	onAuthEvent(t) {
		return p(this, null, function* () {
			let {
				urlResponse: n,
				sessionId: r,
				postBody: i,
				tenantId: o,
				error: s,
				type: a,
			} = t
			if (s) {
				this.reject(s)
				return
			}
			let c = {
				auth: this.auth,
				requestUri: n,
				sessionId: r,
				tenantId: o || void 0,
				postBody: i || void 0,
				user: this.user,
				bypassAuthState: this.bypassAuthState,
			}
			try {
				this.resolve(yield this.getIdpTask(a)(c))
			} catch (u) {
				this.reject(u)
			}
		})
	}
	onError(t) {
		this.reject(t)
	}
	getIdpTask(t) {
		switch (t) {
			case 'signInViaPopup':
			case 'signInViaRedirect':
				return s1
			case 'linkViaPopup':
			case 'linkViaRedirect':
				return c1
			case 'reauthViaPopup':
			case 'reauthViaRedirect':
				return a1
			default:
				Ft(this.auth, 'internal-error')
		}
	}
	resolve(t) {
		cn(this.pendingPromise, 'Pending promise was never set'),
			this.pendingPromise.resolve(t),
			this.unregisterAndCleanUp()
	}
	reject(t) {
		cn(this.pendingPromise, 'Pending promise was never set'),
			this.pendingPromise.reject(t),
			this.unregisterAndCleanUp()
	}
	unregisterAndCleanUp() {
		this.eventManager && this.eventManager.unregisterConsumer(this),
			(this.pendingPromise = null),
			this.cleanUp()
	}
}
var u1 = new Er(2e3, 1e4)
function Ig(e, t, n) {
	return p(this, null, function* () {
		if (ht(e.app))
			return Promise.reject(
				gt(e, 'operation-not-supported-in-this-environment')
			)
		let r = Fu(e)
		vL(e, t, ls)
		let i = yb(r, n)
		return new l1(r, 'signInViaPopup', t, i).executeNotNull()
	})
}
var l1 = (() => {
		class e extends xu {
			constructor(n, r, i, o, s) {
				super(n, r, o, s),
					(this.provider = i),
					(this.authWindow = null),
					(this.pollId = null),
					e.currentPopupAction && e.currentPopupAction.cancel(),
					(e.currentPopupAction = this)
			}
			executeNotNull() {
				return p(this, null, function* () {
					let n = yield this.execute()
					return A(n, this.auth, 'internal-error'), n
				})
			}
			onExecution() {
				return p(this, null, function* () {
					cn(this.filter.length === 1, 'Popup operations only handle one event')
					let n = _g()
					;(this.authWindow = yield this.resolver._openPopup(
						this.auth,
						this.provider,
						this.filter[0],
						n
					)),
						(this.authWindow.associatedEvent = n),
						this.resolver._originValidation(this.auth).catch((r) => {
							this.reject(r)
						}),
						this.resolver._isIframeWebStorageSupported(this.auth, (r) => {
							r || this.reject(gt(this.auth, 'web-storage-unsupported'))
						}),
						this.pollUserCancellation()
				})
			}
			get eventId() {
				var n
				return (
					((n = this.authWindow) === null || n === void 0
						? void 0
						: n.associatedEvent) || null
				)
			}
			cancel() {
				this.reject(gt(this.auth, 'cancelled-popup-request'))
			}
			cleanUp() {
				this.authWindow && this.authWindow.close(),
					this.pollId && window.clearTimeout(this.pollId),
					(this.authWindow = null),
					(this.pollId = null),
					(e.currentPopupAction = null)
			}
			pollUserCancellation() {
				let n = () => {
					var r, i
					if (
						!(
							(i =
								(r = this.authWindow) === null || r === void 0
									? void 0
									: r.window) === null || i === void 0
						) &&
						i.closed
					) {
						this.pollId = window.setTimeout(() => {
							;(this.pollId = null),
								this.reject(gt(this.auth, 'popup-closed-by-user'))
						}, 8e3)
						return
					}
					this.pollId = window.setTimeout(n, u1.get())
				}
				n()
			}
		}
		e.currentPopupAction = null
		return e
	})(),
	d1 = 'pendingRedirect',
	wu = new Map(),
	eg = class e extends xu {
		constructor(t, n, r = !1) {
			super(
				t,
				[
					'signInViaRedirect',
					'linkViaRedirect',
					'reauthViaRedirect',
					'unknown',
				],
				n,
				void 0,
				r
			),
				(this.eventId = null)
		}
		execute() {
			return p(this, null, function* () {
				let t = wu.get(this.auth._key())
				if (!t) {
					try {
						let r = (yield f1(this.resolver, this.auth))
							? yield Un(e.prototype, this, 'execute').call(this)
							: null
						t = () => Promise.resolve(r)
					} catch (n) {
						t = () => Promise.reject(n)
					}
					wu.set(this.auth._key(), t)
				}
				return (
					this.bypassAuthState ||
						wu.set(this.auth._key(), () => Promise.resolve(null)),
					t()
				)
			})
		}
		onAuthEvent(t) {
			return p(this, null, function* () {
				if (t.type === 'signInViaRedirect')
					return Un(e.prototype, this, 'onAuthEvent').call(this, t)
				if (t.type === 'unknown') {
					this.resolve(null)
					return
				}
				if (t.eventId) {
					let n = yield this.auth._redirectUserForId(t.eventId)
					if (n)
						return (
							(this.user = n),
							Un(e.prototype, this, 'onAuthEvent').call(this, t)
						)
					this.resolve(null)
				}
			})
		}
		onExecution() {
			return p(this, null, function* () {})
		}
		cleanUp() {}
	}
function f1(e, t) {
	return p(this, null, function* () {
		let n = g1(t),
			r = p1(e)
		if (!(yield r._isAvailable())) return !1
		let i = (yield r._get(n)) === 'true'
		return yield r._remove(n), i
	})
}
function h1(e, t) {
	wu.set(e._key(), t)
}
function p1(e) {
	return an(e._redirectPersistence)
}
function g1(e) {
	return Iu(d1, e.config.apiKey, e.name)
}
function m1(e, t, n = !1) {
	return p(this, null, function* () {
		if (ht(e.app)) return Promise.reject(yr(e))
		let r = Fu(e),
			i = yb(r, t),
			s = yield new eg(r, i, n).execute()
		return (
			s &&
				!n &&
				(delete s.user._redirectEventId,
				yield r._persistUserIfCurrent(s.user),
				yield r._setRedirectUser(null, t)),
			s
		)
	})
}
var v1 = 10 * 60 * 1e3,
	tg = class {
		constructor(t) {
			;(this.auth = t),
				(this.cachedEventUids = new Set()),
				(this.consumers = new Set()),
				(this.queuedRedirectEvent = null),
				(this.hasHandledPotentialRedirect = !1),
				(this.lastProcessedEventTime = Date.now())
		}
		registerConsumer(t) {
			this.consumers.add(t),
				this.queuedRedirectEvent &&
					this.isEventForConsumer(this.queuedRedirectEvent, t) &&
					(this.sendToConsumer(this.queuedRedirectEvent, t),
					this.saveEventToCache(this.queuedRedirectEvent),
					(this.queuedRedirectEvent = null))
		}
		unregisterConsumer(t) {
			this.consumers.delete(t)
		}
		onEvent(t) {
			if (this.hasEventBeenHandled(t)) return !1
			let n = !1
			return (
				this.consumers.forEach((r) => {
					this.isEventForConsumer(t, r) &&
						((n = !0), this.sendToConsumer(t, r), this.saveEventToCache(t))
				}),
				this.hasHandledPotentialRedirect ||
					!y1(t) ||
					((this.hasHandledPotentialRedirect = !0),
					n || ((this.queuedRedirectEvent = t), (n = !0))),
				n
			)
		}
		sendToConsumer(t, n) {
			var r
			if (t.error && !Eb(t)) {
				let i =
					((r = t.error.code) === null || r === void 0
						? void 0
						: r.split('auth/')[1]) || 'internal-error'
				n.onError(gt(this.auth, i))
			} else n.onAuthEvent(t)
		}
		isEventForConsumer(t, n) {
			let r = n.eventId === null || (!!t.eventId && t.eventId === n.eventId)
			return n.filter.includes(t.type) && r
		}
		hasEventBeenHandled(t) {
			return (
				Date.now() - this.lastProcessedEventTime >= v1 &&
					this.cachedEventUids.clear(),
				this.cachedEventUids.has($D(t))
			)
		}
		saveEventToCache(t) {
			this.cachedEventUids.add($D(t)),
				(this.lastProcessedEventTime = Date.now())
		}
	}
function $D(e) {
	return [e.type, e.eventId, e.sessionId, e.tenantId].filter((t) => t).join('-')
}
function Eb({ type: e, error: t }) {
	return e === 'unknown' && t?.code === 'auth/no-auth-event'
}
function y1(e) {
	switch (e.type) {
		case 'signInViaRedirect':
		case 'linkViaRedirect':
		case 'reauthViaRedirect':
			return !0
		case 'unknown':
			return Eb(e)
		default:
			return !1
	}
}
function E1(n) {
	return p(this, arguments, function* (e, t = {}) {
		return ji(e, 'GET', '/v1/projects', t)
	})
}
var _1 = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,
	I1 = /^https?/
function w1(e) {
	return p(this, null, function* () {
		if (e.config.emulator) return
		let { authorizedDomains: t } = yield E1(e)
		for (let n of t)
			try {
				if (D1(n)) return
			} catch {}
		Ft(e, 'unauthorized-domain')
	})
}
function D1(e) {
	let t = zp(),
		{ protocol: n, hostname: r } = new URL(t)
	if (e.startsWith('chrome-extension://')) {
		let s = new URL(e)
		return s.hostname === '' && r === ''
			? n === 'chrome-extension:' &&
					e.replace('chrome-extension://', '') ===
						t.replace('chrome-extension://', '')
			: n === 'chrome-extension:' && s.hostname === r
	}
	if (!I1.test(n)) return !1
	if (_1.test(e)) return r === e
	let i = e.replace(/\./g, '\\.')
	return new RegExp('^(.+\\.' + i + '|' + i + ')$', 'i').test(r)
}
var b1 = new Er(3e4, 6e4)
function HD() {
	let e = Pt().___jsl
	if (e?.H) {
		for (let t of Object.keys(e.H))
			if (
				((e.H[t].r = e.H[t].r || []),
				(e.H[t].L = e.H[t].L || []),
				(e.H[t].r = [...e.H[t].L]),
				e.CP)
			)
				for (let n = 0; n < e.CP.length; n++) e.CP[n] = null
	}
}
function C1(e) {
	return new Promise((t, n) => {
		var r, i, o
		function s() {
			HD(),
				gapi.load('gapi.iframes', {
					callback: () => {
						t(gapi.iframes.getContext())
					},
					ontimeout: () => {
						HD(), n(gt(e, 'network-request-failed'))
					},
					timeout: b1.get(),
				})
		}
		if (
			!(
				(i = (r = Pt().gapi) === null || r === void 0 ? void 0 : r.iframes) ===
					null || i === void 0
			) &&
			i.Iframe
		)
			t(gapi.iframes.getContext())
		else if (!((o = Pt().gapi) === null || o === void 0) && o.load) s()
		else {
			let a = lb('iframefcb')
			return (
				(Pt()[a] = () => {
					gapi.load ? s() : n(gt(e, 'network-request-failed'))
				}),
				PL(`${FL()}?onload=${a}`).catch((c) => n(c))
			)
		}
	}).catch((t) => {
		throw ((Du = null), t)
	})
}
var Du = null
function T1(e) {
	return (Du = Du || C1(e)), Du
}
var S1 = new Er(5e3, 15e3),
	A1 = '__/auth/iframe',
	M1 = 'emulator/auth/iframe',
	R1 = {
		style: { position: 'absolute', top: '-100px', width: '1px', height: '1px' },
		'aria-hidden': 'true',
		tabindex: '-1',
	},
	N1 = new Map([
		['identitytoolkit.googleapis.com', 'p'],
		['staging-identitytoolkit.sandbox.googleapis.com', 's'],
		['test-identitytoolkit.sandbox.googleapis.com', 't'],
	])
function O1(e) {
	let t = e.config
	A(t.authDomain, e, 'auth-domain-config-required')
	let n = t.emulator ? sg(t, M1) : `https://${e.config.authDomain}/${A1}`,
		r = { apiKey: t.apiKey, appName: e.name, v: ki },
		i = N1.get(e.config.apiHost)
	i && (r.eid = i)
	let o = e._getFrameworks()
	return o.length && (r.fw = o.join(',')), `${n}?${Oi(r).slice(1)}`
}
function k1(e) {
	return p(this, null, function* () {
		let t = yield T1(e),
			n = Pt().gapi
		return (
			A(n, e, 'internal-error'),
			t.open(
				{
					where: document.body,
					url: O1(e),
					messageHandlersFilter: n.iframes.CROSS_ORIGIN_IFRAMES_FILTER,
					attributes: R1,
					dontclear: !0,
				},
				(r) =>
					new Promise((i, o) =>
						p(this, null, function* () {
							yield r.restyle({ setHideOnLeave: !1 })
							let s = gt(e, 'network-request-failed'),
								a = Pt().setTimeout(() => {
									o(s)
								}, S1.get())
							function c() {
								Pt().clearTimeout(a), i(r)
							}
							r.ping(c).then(c, () => {
								o(s)
							})
						})
					)
			)
		)
	})
}
var x1 = { location: 'yes', resizable: 'yes', statusbar: 'yes', toolbar: 'no' },
	P1 = 500,
	F1 = 600,
	L1 = '_blank',
	V1 = 'http://localhost',
	Pu = class {
		constructor(t) {
			;(this.window = t), (this.associatedEvent = null)
		}
		close() {
			if (this.window)
				try {
					this.window.close()
				} catch {}
		}
	}
function j1(e, t, n, r = P1, i = F1) {
	let o = Math.max((window.screen.availHeight - i) / 2, 0).toString(),
		s = Math.max((window.screen.availWidth - r) / 2, 0).toString(),
		a = '',
		c = Object.assign(Object.assign({}, x1), {
			width: r.toString(),
			height: i.toString(),
			top: o,
			left: s,
		}),
		u = we().toLowerCase()
	n && (a = rb(u) ? L1 : n), tb(u) && ((t = t || V1), (c.scrollbars = 'yes'))
	let l = Object.entries(c).reduce((h, [f, m]) => `${h}${f}=${m},`, '')
	if (RL(u) && a !== '_self') return U1(t || '', a), new Pu(null)
	let d = window.open(t || '', a, l)
	A(d, e, 'popup-blocked')
	try {
		d.focus()
	} catch {}
	return new Pu(d)
}
function U1(e, t) {
	let n = document.createElement('a')
	;(n.href = e), (n.target = t)
	let r = document.createEvent('MouseEvent')
	r.initMouseEvent(
		'click',
		!0,
		!0,
		window,
		1,
		0,
		0,
		0,
		0,
		!1,
		!1,
		!1,
		!1,
		1,
		null
	),
		n.dispatchEvent(r)
}
var B1 = '__/auth/handler',
	$1 = 'emulator/auth/handler',
	H1 = encodeURIComponent('fac')
function zD(e, t, n, r, i, o) {
	return p(this, null, function* () {
		A(e.config.authDomain, e, 'auth-domain-config-required'),
			A(e.config.apiKey, e, 'invalid-api-key')
		let s = {
			apiKey: e.config.apiKey,
			appName: e.name,
			authType: n,
			redirectUrl: r,
			v: ki,
			eventId: i,
		}
		if (t instanceof ls) {
			t.setDefaultLanguage(e.languageCode),
				(s.providerId = t.providerId || ''),
				iD(t.getCustomParameters()) ||
					(s.customParameters = JSON.stringify(t.getCustomParameters()))
			for (let [l, d] of Object.entries(o || {})) s[l] = d
		}
		if (t instanceof Ru) {
			let l = t.getScopes().filter((d) => d !== '')
			l.length > 0 && (s.scopes = l.join(','))
		}
		e.tenantId && (s.tid = e.tenantId)
		let a = s
		for (let l of Object.keys(a)) a[l] === void 0 && delete a[l]
		let c = yield e._getAppCheckToken(),
			u = c ? `#${H1}=${encodeURIComponent(c)}` : ''
		return `${z1(e)}?${Oi(a).slice(1)}${u}`
	})
}
function z1({ config: e }) {
	return e.emulator ? sg(e, $1) : `https://${e.authDomain}/${B1}`
}
var Hp = 'webStorageSupport',
	ng = class {
		constructor() {
			;(this.eventManagers = {}),
				(this.iframes = {}),
				(this.originValidationPromises = {}),
				(this._redirectPersistence = Eg),
				(this._completeRedirectFn = m1),
				(this._overrideRedirectResult = h1)
		}
		_openPopup(t, n, r, i) {
			return p(this, null, function* () {
				var o
				cn(
					(o = this.eventManagers[t._key()]) === null || o === void 0
						? void 0
						: o.manager,
					'_initialize() not called before _openPopup()'
				)
				let s = yield zD(t, n, r, zp(), i)
				return j1(t, s, _g())
			})
		}
		_openRedirect(t, n, r, i) {
			return p(this, null, function* () {
				yield this._originValidation(t)
				let o = yield zD(t, n, r, zp(), i)
				return ZL(o), new Promise(() => {})
			})
		}
		_initialize(t) {
			let n = t._key()
			if (this.eventManagers[n]) {
				let { manager: i, promise: o } = this.eventManagers[n]
				return i
					? Promise.resolve(i)
					: (cn(o, 'If manager is not set, promise should be'), o)
			}
			let r = this.initAndGetManager(t)
			return (
				(this.eventManagers[n] = { promise: r }),
				r.catch(() => {
					delete this.eventManagers[n]
				}),
				r
			)
		}
		initAndGetManager(t) {
			return p(this, null, function* () {
				let n = yield k1(t),
					r = new tg(t)
				return (
					n.register(
						'authEvent',
						(i) => (
							A(i?.authEvent, t, 'invalid-auth-event'),
							{ status: r.onEvent(i.authEvent) ? 'ACK' : 'ERROR' }
						),
						gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER
					),
					(this.eventManagers[t._key()] = { manager: r }),
					(this.iframes[t._key()] = n),
					r
				)
			})
		}
		_isIframeWebStorageSupported(t, n) {
			this.iframes[t._key()].send(
				Hp,
				{ type: Hp },
				(i) => {
					var o
					let s = (o = i?.[0]) === null || o === void 0 ? void 0 : o[Hp]
					s !== void 0 && n(!!s), Ft(t, 'internal-error')
				},
				gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER
			)
		}
		_originValidation(t) {
			let n = t._key()
			return (
				this.originValidationPromises[n] ||
					(this.originValidationPromises[n] = w1(t)),
				this.originValidationPromises[n]
			)
		}
		get _shouldInitProactively() {
			return cb() || nb() || dg()
		}
	},
	_b = ng
var WD = '@firebase/auth',
	GD = '1.9.1'
var rg = class {
	constructor(t) {
		;(this.auth = t), (this.internalListeners = new Map())
	}
	getUid() {
		var t
		return (
			this.assertAuthConfigured(),
			((t = this.auth.currentUser) === null || t === void 0 ? void 0 : t.uid) ||
				null
		)
	}
	getToken(t) {
		return p(this, null, function* () {
			return (
				this.assertAuthConfigured(),
				yield this.auth._initializationPromise,
				this.auth.currentUser
					? { accessToken: yield this.auth.currentUser.getIdToken(t) }
					: null
			)
		})
	}
	addAuthTokenListener(t) {
		if ((this.assertAuthConfigured(), this.internalListeners.has(t))) return
		let n = this.auth.onIdTokenChanged((r) => {
			t(r?.stsTokenManager.accessToken || null)
		})
		this.internalListeners.set(t, n), this.updateProactiveRefresh()
	}
	removeAuthTokenListener(t) {
		this.assertAuthConfigured()
		let n = this.internalListeners.get(t)
		n && (this.internalListeners.delete(t), n(), this.updateProactiveRefresh())
	}
	assertAuthConfigured() {
		A(this.auth._initializationPromise, 'dependent-sdk-initialized-before-auth')
	}
	updateProactiveRefresh() {
		this.internalListeners.size > 0
			? this.auth._startProactiveRefresh()
			: this.auth._stopProactiveRefresh()
	}
}
function W1(e) {
	switch (e) {
		case 'Node':
			return 'node'
		case 'ReactNative':
			return 'rn'
		case 'Worker':
			return 'webworker'
		case 'Cordova':
			return 'cordova'
		case 'WebExtension':
			return 'web-extension'
		default:
			return
	}
}
function G1(e) {
	on(
		new He(
			'auth',
			(t, { options: n }) => {
				let r = t.getProvider('app').getImmediate(),
					i = t.getProvider('heartbeat'),
					o = t.getProvider('app-check-internal'),
					{ apiKey: s, authDomain: a } = r.options
				A(s && !s.includes(':'), 'invalid-api-key', { appName: r.name })
				let c = {
						apiKey: s,
						authDomain: a,
						clientPlatform: e,
						apiHost: 'identitytoolkit.googleapis.com',
						tokenApiHost: 'securetoken.googleapis.com',
						apiScheme: 'https',
						sdkClientVersion: ub(e),
					},
					u = new Zp(r, i, o, c)
				return LL(u, n), u
			},
			'PUBLIC'
		)
			.setInstantiationMode('EXPLICIT')
			.setInstanceCreatedCallback((t, n, r) => {
				t.getProvider('auth-internal').initialize()
			})
	),
		on(
			new He(
				'auth-internal',
				(t) => {
					let n = Fu(t.getProvider('auth').getImmediate())
					return ((r) => new rg(r))(n)
				},
				'PRIVATE'
			).setInstantiationMode('EXPLICIT')
		),
		Ee(WD, GD, W1(e)),
		Ee(WD, GD, 'esm2017')
}
var q1 = 5 * 60,
	K1 = vp('authIdTokenMaxAge') || q1,
	qD = null,
	Y1 = (e) => (t) =>
		p(void 0, null, function* () {
			let n = t && (yield t.getIdTokenResult()),
				r = n && (new Date().getTime() - Date.parse(n.issuedAtTime)) / 1e3
			if (r && r > K1) return
			let i = n?.token
			qD !== i &&
				((qD = i),
				yield fetch(e, {
					method: i ? 'POST' : 'DELETE',
					headers: i ? { Authorization: `Bearer ${i}` } : {},
				}))
		})
function wg(e = ts()) {
	let t = hu(e, 'auth')
	if (t.isInitialized()) return t.getImmediate()
	let n = hg(e, { popupRedirectResolver: _b, persistence: [vb, hb, Eg] }),
		r = vp('authTokenSyncURL')
	if (r && typeof isSecureContext == 'boolean' && isSecureContext) {
		let o = new URL(r, location.origin)
		if (location.origin === o.origin) {
			let s = Y1(o.toString())
			vg(n, s, () => s(n.currentUser)), mg(n, (a) => s(a))
		}
	}
	let i = Qw('auth')
	return i && pg(n, `http://${i}`), n
}
function Z1() {
	var e, t
	return (t =
		(e = document.getElementsByTagName('head')) === null || e === void 0
			? void 0
			: e[0]) !== null && t !== void 0
		? t
		: document
}
xL({
	loadJS(e) {
		return new Promise((t, n) => {
			let r = document.createElement('script')
			r.setAttribute('src', e),
				(r.onload = t),
				(r.onerror = (i) => {
					let o = gt('internal-error')
					;(o.customData = i), n(o)
				}),
				(r.type = 'text/javascript'),
				(r.charset = 'UTF-8'),
				Z1().appendChild(r)
		})
	},
	gapiScript: 'https://apis.google.com/js/api.js',
	recaptchaV2Script: 'https://www.google.com/recaptcha/api.js',
	recaptchaEnterpriseScript:
		'https://www.google.com/recaptcha/enterprise.js?render=',
})
G1('Browser')
var Ib = 'auth',
	Ir = class {
		constructor(t) {
			return t
		}
	},
	Dg = class {
		constructor() {
			return mu(Ib)
		}
	}
var bg = new E('angularfire2.auth-instances')
function BV(e, t) {
	let n = xp(Ib, e, t)
	return n && new Ir(n)
}
function $V(e) {
	return (t, n) => {
		let r = t.runOutsideAngular(() => e(n))
		return new Ir(r)
	}
}
var HV = { provide: Dg, deps: [[new Zt(), bg]] },
	zV = { provide: Ir, useFactory: BV, deps: [[new Zt(), bg], vr] }
function wb(e, ...t) {
	return (
		Ee('angularfire', Pi.full, 'auth'),
		qe([
			zV,
			HV,
			{
				provide: bg,
				useFactory: $V(e),
				multi: !0,
				deps: [j, ae, Fi, ns, [new Zt(), yu], ...t],
			},
		])
	)
}
var Db = mr(wg, !0)
var bb = mr(Ig, !0, 2)
var Cb = mr(yg, !0, 2)
var Lt = class e {
	constructor(t, n, r, i) {
		this.http = t
		this.auth = n
		this.router = r
		this.platformId = i
		;(this.isBrowser = Mn(this.platformId)),
			this.isBrowser && this.initializeFromStorage()
	}
	url = `${ou.apiUrl}/auth`
	userSubject = new ee(null)
	user$ = this.userSubject.asObservable()
	isBrowser
	tokenExpirationTimer
	initializeFromStorage() {
		let t = localStorage.getItem('token')
		if (t)
			try {
				let n = this.parseUserFromToken(t)
				if (n.exp) {
					let r = new Date(n.exp * 1e3)
					if (r <= new Date()) {
						console.log('Stored token already expired, logging out'),
							this.logout()
						return
					}
					this.setTokenExpirationTimer(r)
				}
				this.userSubject.next(n), this.validateToken()
			} catch (n) {
				console.error('Error initializing from storage:', n), this.logout()
			}
	}
	loginWithEmail(t) {
		return this.http.post(`${this.url}/login-email`, { email: t }).pipe(
			J((n) => console.log('Magic link sent successfully', n)),
			et((n) => (console.error('Error sending magic link:', n), yt(() => n)))
		)
	}
	verifyEmailLogin(t, n) {
		return this.http
			.post(`${this.url}/verify-email`, { email: t, token: n })
			.pipe(
				J((r) => {
					console.log('Email verification successful:', r),
						this.storeUserData(r),
						this.router.navigate(['/chat'])
				}),
				et(
					(r) => (
						console.error('Email verification failed:', r),
						this.router.navigate(['/login']),
						yt(() => r)
					)
				)
			)
	}
	validateToken() {
		this.http.get(`${this.url}/validate-token`).subscribe({
			next: (t) => {
				t.valid || this.logout()
			},
			error: (t) => {
				console.error('Token validation error:', t), this.logout()
			},
		})
	}
	refreshToken() {
		let t = this.getRefreshToken()
		return t
			? this.http.post(`${this.url}/refresh-token`, { refreshToken: t }).pipe(
					J((n) => {
						n && n.token && this.storeUserFromToken(n.token)
					})
			  )
			: yt(() => new Error('No refresh token available'))
	}
	getRefreshToken() {
		return this.userSubject.value?.refreshToken || null
	}
	parseUserFromToken(t) {
		let n = t.split('.')
		if (n.length !== 3) throw new Error('Invalid token format')
		try {
			let r = JSON.parse(atob(n[1]))
			return {
				token: t,
				email:
					r.email ||
					r[
						'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'
					],
				name:
					r.name ||
					r['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'],
				exp: r.exp,
			}
		} catch (r) {
			throw (
				(console.error('Error parsing token:', r),
				new Error('Failed to parse token'))
			)
		}
	}
	storeUserData(t) {
		if (
			this.isBrowser &&
			(localStorage.setItem('token', t.token),
			localStorage.setItem('user', JSON.stringify(t)),
			this.userSubject.next(t),
			t.exp)
		) {
			let n = new Date(t.exp * 1e3)
			this.setTokenExpirationTimer(n)
		}
	}
	storeUserFromToken(t) {
		if (this.isBrowser)
			try {
				let n = this.parseUserFromToken(t)
				if (
					(localStorage.setItem('token', t),
					localStorage.setItem('user', JSON.stringify(n)),
					this.userSubject.next(n),
					n.exp)
				) {
					let r = new Date(n.exp * 1e3)
					this.setTokenExpirationTimer(r)
				}
			} catch (n) {
				console.error('Error storing user from token:', n)
			}
	}
	setTokenExpirationTimer(t) {
		if (!this.isBrowser) return
		let n = t.getTime() - new Date().getTime()
		console.log(`Token expires in ${n / 1e3} seconds`),
			this.tokenExpirationTimer && clearTimeout(this.tokenExpirationTimer),
			(this.tokenExpirationTimer = setTimeout(() => {
				console.log('Token expired, logging out'), this.logout()
			}, n))
	}
	googleLogin() {
		return p(this, null, function* () {
			try {
				let t = new gg()
				t.setCustomParameters({ prompt: 'select_account' })
				let n = yield bb(this.auth, t)
				if (!n.user)
					throw new Error('No user returned from Google authentication')
				let r = yield n.user.getIdToken(),
					i = yield pl(
						this.http.post(`${this.url}/login-google`, { idToken: r })
					)
				return this.storeUserData(i), this.router.navigate(['/chat']), i
			} catch (t) {
				throw (console.error('Google login error:', t), t)
			}
		})
	}
	logout() {
		return p(this, null, function* () {
			if (
				(this.tokenExpirationTimer &&
					(clearTimeout(this.tokenExpirationTimer),
					(this.tokenExpirationTimer = null)),
				localStorage.removeItem('token'),
				localStorage.removeItem('user'),
				this.userSubject.next(null),
				this.isBrowser && this.auth.currentUser)
			)
				try {
					yield Cb(this.auth), console.log('User has signed out from Firebase')
				} catch (t) {
					console.warn('Error signing out from Firebase:', t)
				}
			this.router.navigate(['/login'])
		})
	}
	isAuthenticated() {
		if (!this.isBrowser || !localStorage.getItem('token')) return !1
		try {
			let n = JSON.parse(localStorage.getItem('user') || '{}')
			return n.exp && new Date(n.exp * 1e3) <= new Date()
				? (console.log('Token expired'), this.logout(), !1)
				: !0
		} catch (n) {
			return console.error('Error checking authentication:', n), !1
		}
	}
	static ɵfac = function (n) {
		return new (n || e)(I(Do), I(Ir), I(Ie), I(ye))
	}
	static ɵprov = _({ token: e, factory: e.ɵfac, providedIn: 'root' })
}
function GV(e, t) {
	if ((e & 1 && ($(0, 'div', 16), re(1), H()), e & 2)) {
		let n = Ec()
		ne(), di(' ', n.errorMessage, ' ')
	}
}
function qV(e, t) {
	e & 1 && ($(0, 'span', 17), re(1, '\u27F3'), H())
}
var ju = class e {
	constructor(t) {
		this.authService = t
	}
	email = ''
	isLoading = !1
	errorMessage = null
	loginWithEmail() {
		if (!this.email) {
			this.errorMessage = 'Please enter your email address'
			return
		}
		;(this.isLoading = !0),
			(this.errorMessage = null),
			this.authService.loginWithEmail(this.email).subscribe({
				next: (t) => {
					;(this.isLoading = !1), alert('Check your email for the login link.')
				},
				error: (t) => {
					;(this.isLoading = !1),
						(this.errorMessage =
							'Failed to send login link. Please try again.'),
						console.error('Error:', t)
				},
			})
	}
	loginWithGoogle() {
		return p(this, null, function* () {
			;(this.isLoading = !0), (this.errorMessage = null)
			try {
				yield this.authService.googleLogin()
			} catch (t) {
				;(this.errorMessage = 'Google login failed. Please try again.'),
					console.error('Google Auth Error:', t)
			} finally {
				this.isLoading = !1
			}
		})
	}
	static ɵfac = function (n) {
		return new (n || e)(M(Lt))
	}
	static ɵcmp = Tt({
		type: e,
		selectors: [['app-login']],
		decls: 21,
		vars: 8,
		consts: [
			[
				1,
				'max-w-md',
				'mx-auto',
				'bg-white',
				'dark:bg-gray-800',
				'rounded-xl',
				'shadow-md',
				'overflow-hidden',
				'p-8',
				'mt-10',
			],
			[
				1,
				'text-2xl',
				'font-bold',
				'text-center',
				'text-gray-800',
				'dark:text-white',
				'mb-6',
			],
			[
				'class',
				'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg mb-4 text-sm',
				4,
				'ngIf',
			],
			[1, 'mb-6'],
			[
				'type',
				'email',
				'placeholder',
				'Enter your email',
				'required',
				'',
				1,
				'w-full',
				'px-4',
				'py-2',
				'border',
				'border-gray-300',
				'dark:border-gray-600',
				'bg-white',
				'dark:bg-gray-700',
				'rounded-lg',
				'focus:ring-2',
				'focus:ring-emerald-500',
				'focus:border-emerald-500',
				'outline-none',
				'transition-colors',
				'dark:text-white',
				3,
				'ngModelChange',
				'ngModel',
				'disabled',
			],
			[
				1,
				'w-full',
				'mt-3',
				'bg-emerald-600',
				'hover:bg-emerald-700',
				'text-white',
				'font-medium',
				'py-2',
				'px-4',
				'rounded-lg',
				'transition-colors',
				'disabled:opacity-50',
				'disabled:cursor-not-allowed',
				3,
				'click',
				'disabled',
			],
			['class', 'inline-block animate-spin mr-2', 4, 'ngIf'],
			[1, 'relative', 'flex', 'items-center', 'justify-center', 'mb-6'],
			[1, 'flex-grow', 'border-t', 'border-gray-300', 'dark:border-gray-600'],
			[
				1,
				'flex-shrink',
				'mx-4',
				'text-gray-500',
				'dark:text-gray-400',
				'text-sm',
			],
			[
				1,
				'w-full',
				'flex',
				'items-center',
				'justify-center',
				'bg-white',
				'dark:bg-gray-700',
				'border',
				'border-gray-300',
				'dark:border-gray-600',
				'rounded-lg',
				'px-4',
				'py-2',
				'text-gray-700',
				'dark:text-white',
				'hover:bg-gray-50',
				'dark:hover:bg-gray-600',
				'transition-colors',
				'disabled:opacity-50',
				'disabled:cursor-not-allowed',
				3,
				'click',
				'disabled',
			],
			['viewBox', '0 0 24 24', 1, 'w-5', 'h-5', 'mr-2'],
			[
				'fill',
				'#4285F4',
				'd',
				'M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z',
			],
			[
				'fill',
				'#34A853',
				'd',
				'M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z',
			],
			[
				'fill',
				'#FBBC05',
				'd',
				'M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z',
			],
			[
				'fill',
				'#EA4335',
				'd',
				'M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z',
			],
			[
				1,
				'bg-red-50',
				'dark:bg-red-900/30',
				'text-red-600',
				'dark:text-red-400',
				'p-3',
				'rounded-lg',
				'mb-4',
				'text-sm',
			],
			[1, 'inline-block', 'animate-spin', 'mr-2'],
		],
		template: function (n, r) {
			n & 1 &&
				($(0, 'div', 0)(1, 'h2', 1),
				re(2, 'Login'),
				H(),
				Qt(3, GV, 2, 1, 'div', 2),
				$(4, 'div', 3)(5, 'input', 4),
				mo('ngModelChange', function (o) {
					return _c(r.email, o) || (r.email = o), o
				}),
				H(),
				$(6, 'button', 5),
				Ue('click', function () {
					return r.loginWithEmail()
				}),
				Qt(7, qV, 2, 0, 'span', 6),
				re(8),
				H()(),
				$(9, 'div', 7),
				Ze(10, 'div', 8),
				$(11, 'span', 9),
				re(12, 'OR'),
				H(),
				Ze(13, 'div', 8),
				H(),
				$(14, 'button', 10),
				Ue('click', function () {
					return r.loginWithGoogle()
				}),
				ao(),
				$(15, 'svg', 11),
				Ze(16, 'path', 12)(17, 'path', 13)(18, 'path', 14)(19, 'path', 15),
				H(),
				re(20),
				H()()),
				n & 2 &&
					(ne(3),
					Pe('ngIf', r.errorMessage),
					ne(2),
					go('ngModel', r.email),
					Pe('disabled', r.isLoading),
					ne(),
					Pe('disabled', r.isLoading),
					ne(),
					Pe('ngIf', r.isLoading),
					ne(),
					di(' ', r.isLoading ? 'Sending...' : 'Login with Email', ' '),
					ne(6),
					Pe('disabled', r.isLoading),
					ne(6),
					di(' ', r.isLoading ? 'Connecting...' : 'Login with Google', ' '))
		},
		dependencies: [Mt, gi, Ni, Ri, ru, up, Jo],
		encapsulation: 2,
	})
}
var Uu = class e {
	constructor(t, n, r) {
		this.route = t
		this.router = n
		this.authService = r
	}
	message = 'Verifying your email...'
	ngOnInit() {
		this.route.queryParams.subscribe((t) => {
			let n = t.email,
				r = t.token
			if (n && r)
				try {
					this.authService.storeUserFromToken(r),
						(this.message = 'Verification successful! Redirecting...'),
						setTimeout(() => {
							this.router.navigate(['/chat'])
						}, 1500)
				} catch (i) {
					console.error('Verification error:', i),
						(this.message = 'Verification failed. Please try again.'),
						setTimeout(() => {
							this.router.navigate(['/login'])
						}, 2e3)
				}
			else
				(this.message = 'Invalid verification link. Redirecting to login...'),
					setTimeout(() => {
						this.router.navigate(['/login'])
					}, 2e3)
		})
	}
	static ɵfac = function (n) {
		return new (n || e)(M(kt), M(Ie), M(Lt))
	}
	static ɵcmp = Tt({
		type: e,
		selectors: [['app-email-verification']],
		decls: 3,
		vars: 1,
		consts: [[1, 'verification-container']],
		template: function (n, r) {
			n & 1 && ($(0, 'div', 0)(1, 'p'), re(2), H()()),
				n & 2 && (ne(2), Sn(r.message))
		},
		dependencies: [Mt],
		styles: [
			'.verification-container[_ngcontent-%COMP%]{text-align:center;margin-top:50px;padding:20px;background-color:#f5f5f5;border-radius:8px;max-width:400px;margin-left:auto;margin-right:auto}',
		],
	})
}
var Bu = class e {
	constructor(t, n, r) {
		this.authService = t
		this.router = n
		this.platformId = r
	}
	canActivate() {
		return !Mn(this.platformId) || this.authService.isAuthenticated()
			? !0
			: (this.router.navigate(['/login']), !1)
	}
	static ɵfac = function (n) {
		return new (n || e)(I(Lt), I(Ie), I(ye))
	}
	static ɵprov = _({ token: e, factory: e.ɵfac, providedIn: 'root' })
}
var Tb = [
	{ path: 'login', component: ju },
	{ path: 'verify-email', component: Uu },
	{ path: 'chat', component: au, canActivate: [Bu] },
	{ path: '**', redirectTo: 'login' },
]
var $u = class e {
	constructor(t) {
		this.platformId = t
	}
	intercept(t, n) {
		if (Mn(this.platformId)) {
			let r = localStorage.getItem('token')
			r && (t = t.clone({ setHeaders: { Authorization: `Bearer ${r}` } }))
		}
		return n.handle(t)
	}
	static ɵfac = function (n) {
		return new (n || e)(I(ye))
	}
	static ɵprov = _({ token: e, factory: e.ɵfac })
}
var Sb = {
	providers: [
		dI(hI(), fI()),
		{ provide: lh, useClass: $u, multi: !0 },
		Hd(SI, Ni),
		C_({ eventCoalescing: !0 }),
		_w(Tb),
		RI(MI()),
		wD(() =>
			DD({
				projectId: 'ai-tattoo-assistant',
				appId: '1:605619790926:web:002610f0e4f6a8a3ab8f1f',
				storageBucket: 'ai-tattoo-assistant.firebasestorage.app',
				apiKey: 'AIzaSyBqLP0Bmromi20sUxuxtpS37DXmMMjbc5o',
				authDomain: 'ai-tattoo-assistant.firebaseapp.com',
				messagingSenderId: '605619790926',
				measurementId: 'G-J0BRQKWF1B',
			})
		),
		wb(() => Db()),
	],
}
var Hu = class e {
	constructor(t, n, r, i) {
		this.platformId = t
		this.ngZone = r
		this.appRef = i
		if (
			((this.isBrowser = Mn(this.platformId)),
			(this.renderer = n.createRenderer(null, null)),
			this.isBrowser)
		) {
			let o = document.documentElement.classList.contains('dark')
			this.darkMode.next(o), console.log('Initial dark mode state:', o)
		}
	}
	darkMode = new ee(!1)
	darkMode$ = this.darkMode.asObservable()
	isBrowser
	renderer
	getCurrentValue() {
		return this.darkMode.value
	}
	setDarkMode(t) {
		if (
			(console.log('Setting dark mode to:', t),
			this.darkMode.next(t),
			this.isBrowser)
		)
			try {
				t
					? this.renderer.addClass(document.documentElement, 'dark')
					: this.renderer.removeClass(document.documentElement, 'dark'),
					localStorage.setItem('theme', t ? 'dark' : 'light'),
					this.renderer.setStyle(
						document.body,
						'transition',
						'background-color 0.3s ease'
					),
					console.log(
						'Dark mode class applied:',
						document.documentElement.classList.contains('dark')
					),
					this.appRef.tick()
			} catch (n) {
				console.error('Error setting dark mode:', n)
			}
	}
	toggleTheme() {
		console.log('Toggle button clicked')
		let t = this.darkMode.value
		console.log('Current dark mode value before toggle:', t),
			console.log(
				'HTML class before toggle:',
				document.documentElement.classList.contains('dark')
			),
			this.setDarkMode(!t),
			console.log('New dark mode value after toggle:', this.darkMode.value),
			console.log(
				'HTML class after toggle:',
				document.documentElement.classList.contains('dark')
			)
	}
	static ɵfac = function (n) {
		return new (n || e)(I(ye), I(_n), I(j), I(ve))
	}
	static ɵprov = _({ token: e, factory: e.ɵfac, providedIn: 'root' })
}
function YV(e, t) {
	if (e & 1) {
		let n = yc()
		Vf(0),
			$(1, 'a', 10),
			Ue('click', function () {
				Xr(n)
				let i = Ec()
				return ei(i.logout())
			}),
			re(2, 'Logout'),
			H(),
			jf()
	}
}
function ZV(e, t) {
	e & 1 && ($(0, 'a', 11), re(1, 'Login'), H())
}
var zu = class e {
	constructor(t, n, r, i) {
		this.themeService = t
		this.authService = n
		this.router = r
		this.cdr = i
		this.isDarkMode$ = this.themeService.darkMode$
	}
	title = 'AI Tattoo Assistant'
	isDarkMode$
	htmlClass = ''
	ngOnInit() {
		this.updateHtmlClassState(),
			this.isDarkMode$.subscribe((t) => {
				console.log('Dark mode subscription updated:', t),
					this.updateHtmlClassState()
			})
	}
	toggleTheme() {
		console.log('Toggle theme called in app component')
		let t = this.themeService.getCurrentValue()
		console.log('Current value before toggle:', t),
			this.themeService.toggleTheme(),
			this.cdr.detectChanges(),
			this.updateHtmlClassState(),
			console.log(
				'After toggle, dark mode is:',
				this.themeService.getCurrentValue()
			)
	}
	logout() {
		console.log('Logout called'),
			this.authService.logout(),
			this.router.navigate(['/login'])
	}
	getHtmlClass() {
		return typeof document < 'u'
			? document.documentElement.classList.contains('dark')
				? 'dark'
				: 'light'
			: 'unknown'
	}
	updateHtmlClassState() {
		;(this.htmlClass = this.getHtmlClass()),
			console.log('HTML class updated to:', this.htmlClass)
	}
	forceRefresh() {
		console.log('Force refresh called')
		let t = this.themeService.getCurrentValue()
		console.log('Current dark mode value:', t),
			this.themeService.setDarkMode(!t),
			this.cdr.detectChanges(),
			this.updateHtmlClassState(),
			console.log(
				'After force refresh, dark mode is:',
				this.themeService.getCurrentValue()
			),
			console.log('HTML class is now:', this.getHtmlClass())
	}
	static ɵfac = function (n) {
		return new (n || e)(M(Hu), M(Lt), M(Ie), M(St))
	}
	static ɵcmp = Tt({
		type: e,
		selectors: [['app-root']],
		decls: 19,
		vars: 5,
		consts: [
			['loginLink', ''],
			[
				1,
				'min-h-screen',
				'flex',
				'flex-col',
				'bg-gray-50',
				'text-gray-800',
				'dark:bg-gray-900',
				'dark:text-gray-100',
			],
			[
				1,
				'bg-white',
				'dark:bg-gray-800',
				'shadow-sm',
				'py-4',
				'px-6',
				'flex',
				'justify-between',
				'items-center',
			],
			[1, 'text-xl', 'font-bold', 'text-emerald-600', 'dark:text-emerald-500'],
			[1, 'flex', 'items-center', 'space-x-4'],
			[
				'routerLink',
				'/chat',
				1,
				'text-gray-600',
				'dark:text-gray-300',
				'hover:text-emerald-600',
				'dark:hover:text-emerald-400',
				'transition-colors',
			],
			[1, 'text-gray-300', 'dark:text-gray-600'],
			[4, 'ngIf', 'ngIfElse'],
			[1, 'flex-grow', 'container', 'mx-auto', 'px-4', 'py-6', 'max-w-4xl'],
			[
				1,
				'bg-white',
				'dark:bg-gray-800',
				'py-4',
				'text-center',
				'text-gray-500',
				'dark:text-gray-400',
				'text-sm',
				'border-t',
				'dark:border-gray-700',
			],
			[
				1,
				'text-gray-600',
				'dark:text-gray-300',
				'hover:text-emerald-600',
				'dark:hover:text-emerald-400',
				'transition-colors',
				'cursor-pointer',
				3,
				'click',
			],
			[
				'routerLink',
				'/login',
				1,
				'text-gray-600',
				'dark:text-gray-300',
				'hover:text-emerald-600',
				'dark:hover:text-emerald-400',
				'transition-colors',
			],
		],
		template: function (n, r) {
			if (
				(n & 1 &&
					($(0, 'div', 1)(1, 'header', 2)(2, 'h1', 3),
					re(3),
					H(),
					$(4, 'div', 4)(5, 'nav', 4)(6, 'a', 5),
					re(7, 'Chat'),
					H(),
					$(8, 'span', 6),
					re(9, '|'),
					H(),
					Qt(10, YV, 3, 0, 'ng-container', 7),
					__(11, 'async'),
					Qt(12, ZV, 2, 0, 'ng-template', null, 0, w_),
					H()()(),
					$(14, 'main', 8),
					Ze(15, 'router-outlet'),
					H(),
					$(16, 'footer', 9)(17, 'p'),
					re(18, '\xA9 2025 AI Tattoo Assistant'),
					H()()()),
				n & 2)
			) {
				let i = v_(13)
				ne(3),
					Sn(r.title),
					ne(7),
					Pe('ngIf', I_(11, 3, r.authService.user$))('ngIfElse', i)
			}
		},
		dependencies: [Cw, Jh, yw, Mt, gi, z_],
		encapsulation: 2,
	})
}
CI(zu, Sb).catch((e) => console.error(e))
