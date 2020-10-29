import React, { Component } from 'react';
import Section from './Section';
import smoothScroll from 'utility/smoothscroll';
import BackToTop from './BackToTop';
import { Link } from 'react-router-dom';


class Home extends Component {
    
    constructor(props) {
        super(props);
        this.keyDownHandler = this.handleKeyDown.bind(this);
        this.getCurrent = this.getCurrent.bind(this);
        this.disactiveSection = this.disactiveSection.bind(this);
        this.activateSection = this.activateSection.bind(this);
        this.scroll = this.scroll.bind(this);
        this.sections = [];
        this.current = this.getCurrent();
        this.scrolling = false;
        this.timer = null;
    }

    handleStart() {
        const startEle = document.getElementById("flexible-backup");
        this.scrolling = true;
        smoothScroll(startEle, null, () => this.scrolling = false);
    }

    componentDidMount() {
        window.addEventListener("keydown", this.keyDownHandler);
    }

    handleScroll() {
       if(!this.scrolling) {
           if(this.timer) {
               clearTimeout(this.timer);
           }
           this.timer = setTimeout(this.scroll, 1);
       }else {
           console.log("doesn't invoke the scroll function, for it is scrolling");
       }
    }

    scroll() {
        this.scrolling = true;
        const position = window.scrollY;
        let next, current;
        next = current = this.current;
        console.log(position, this.position)

        if(position == this.position) {
            this.scrolling = false;
            return;
        }

        if(position > this.position) {
            // scroll down
            current < 3 && (next = current + 1); 
        }
        
        if(position < this.position){
            // scroll up
            current >= 0 && (next = current - 1);
        }

        if(next != current) {
            let nextDom = (next == -1? this.background: this.sections[next].main);
            console.log("start to scroll", current, next);

            smoothScroll(nextDom, 600, 
            () => {
                this.current = next;
                // this.scrolling = false;
                // update the pisition;
                this.position = window.scrollY;
                //this.scrolling = false;
                setTimeout(() => this.scrolling = false, 1000);
                console.log("finished scrolling", this.position);
            });
        }
    }

    componentWillUnmount() {
        window.removeEventListener("keydown", this.keyDownHandler);
    }

    getCurrent() {
        const height = window.innerHeight;
        const position = window.scrollY;
        const current = Math.floor(position/height) - 1;
        return current;
    }

    disactiveSection(index) {
        this.sections[index].main.classList.remove("active-section");
        this.sections[index].main.classList.add("leaving-section");
    }

    activateSection(index) {
        this.sections[index].main.classList.remove("leaving-section");
        this.sections[index].main.classList.add("active-section");
    }

    handleKeyDown(event) {
        const keyCode = event.keyCode;

        if(keyCode === 40  || keyCode === 13) {
            let current = this.getCurrent();
            if(current < 3) {
                this.handleNext(current, false);
            }
        }else if(keyCode === 38) {
            let current = this.getCurrent();
            if(current > -1) {
                this.handleNext(current, true);
            }
        }
    }

    handleNext(index, up) {
        let next = up? index - 1: index + 1;
        let nextDom = (next == -1? this.background: (next == 4? this.checkout: this.sections[next].main));
        
        smoothScroll(nextDom, 600, 
            () => {
                // this.current = next;
                // // this.scrolling = false;
                // // update the pisition;
                // this.position = window.scrollY;
                // //this.scrolling = false;
                // setTimeout(() => this.scrolling = false, 1000);
                // console.log("finished scrolling", this.position);
            });
    }

    render() {
        return (
            <main className='home'>
                <div className='background' id="home-top" ref={ dom => this.background = dom }>
                    <div className='title'>MongoDB Backup Manager - MDBBM</div>
                    <div className='subtitle'>Fined-grained Controll</div>
                    <div className='button-wrapper'>
                        <div className='button primary' onClick={ this.handleStart.bind(this) }>take a tour</div>
                        <Link className='button primary' to="get_started">Install</Link>
                    </div>
                </div>
                <Section
                    sectionId="flexible-backup"
                    description="Fined-grained backup configuration"
                    backgroundImage={`./static/img/new_backup.gif`}
                    ref={ section => this.sections[0] = section }
                    onUp={ this.handleNext.bind(this, 0, true) }
                    onDown={ this.handleNext.bind(this, 0, false) }
                />
                <Section
                    sectionId="real-time"
                    description="Get the real-time backup status"
                    backgroundImage={`./static/img/real-time.gif`}
                    ref={ section => this.sections[1] = section }
                    onUp={ this.handleNext.bind(this, 1, true) }
                    onDown={ this.handleNext.bind(this, 1, false) }
                />
                <Section
                    sectionId="multiple-backups"
                    description="Manage multiple backups"
                    backgroundImage={`./static/img/multiple.gif`}
                    ref={ section => this.sections[2] = section }
                    onUp={ this.handleNext.bind(this, 2, true) }
                    onDown={ this.handleNext.bind(this, 2, false) }
                />
                <Section
                    sectionId="update-backup"
                    description="Update backup config whenever you want"
                    backgroundImage={`./static/img/update.gif`}
                    ref={ section => this.sections[3] = section }
                    onUp={ this.handleNext.bind(this, 3, true) }
                    last={ true }
                    onStart={ () => props.history.push('/get_started') }
                />
                <BackToTop/>
            </main>
        )
    }
}

export default Home;