class EventEmitter {
  constructor(){
    this.events = {}
  }
  on(evtName, cb){
    this.events[evtName] = (this.events[evtName] || []).push(cb)
  }
  emit(evtName, ...args){
    (this.events[evtName] || []).forEach(cb => {
      cb(...args)
    })
  }

}
export default new EventEmitter()
