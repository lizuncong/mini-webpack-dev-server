class EventEmitter {
  constructor(){
    this.events = {}
  }
  on(evtName, cb){
    const cbs = this.events[evtName] || [];
    cbs.push(cb)
    this.events[evtName] = cbs
  }
  emit(evtName, ...args){
    (this.events[evtName] || []).forEach(cb => {
      cb(...args)
    })
  }

}
export default new EventEmitter()
