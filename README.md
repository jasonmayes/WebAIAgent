# Web 4.0: AI Agents using Web AI - client side smarts for advanced user experiences
A Web AI Agent running entirely client side in browser, that's capable of controlling a fictional flights webpage, to get the job done by using Google's Gemma 2 (2B) model in JavaScript via WebGPU thanks to the MediaPipe Web LLM library, combined with some extra function calling logic to enable advanced user experiences.

Click the image below to watch the YouTube video of it in action:

[![Watch this Web AI Agent demo in action on YouTube](https://github.com/jasonmayes/WebAIAgent/blob/main/WebAIFlightsAgent_Thumb.jpg?raw=true)](https://youtu.be/IC256KyITLw)

## Notes

1. You must use a modern browser that supports WebGPU to run this demo
2. The model file is a 2.5GB download! Caching needs to be implemented to make this feasible for production so not downloading every page refresh.
3. This is very much a work in progress and not suitable for production without signficant testing and refinement. This is a proof of concept to show how Web AI models running entirely locally could be used to control and perform useful actions on the websites we frequently use without any dependency on a cloud API. This model has not been finetuned for this task and is an out of the box Gemma 2 2B LLM driving the experience.

## Hardware requirements

Any GPU onboard or dedicated that has at least 4.5 GB of memory available should be able to run the demo. I have tested this on a 6 year old Dell XPS with an Intel CPU with onboard graphics and it runs (though slower). Modern Intel laptops work much faster with their newer integrated graphics chips. I have also tested on a desktop class NVIDIA 1070 GPU and that runs very fast - so you dont need the latest GPU to run this well!

## Demo time

A [live demo is available on Codepen](https://codepen.io/jasonmayes/full/yyBprNN). Just click and open the link and wait for the 2.5GB model download - it will take time so use good WiFi when opening! Be sure to [watch my YouTube video to learn how to use for best experience](https://youtu.be/IC256KyITLw). 

If any issues open the blue side panel on the right by hoving over it and click the clear memory button at the bottom to start over if you managed to get the Agent into an odd state. Often just specifying any undefined fields that are not specified helps it move along even if it asks you a different question.

## Questions / Contact

I will be adding to this over time but if you have any questions / feedback then you can find me over on LinkedIn or Twitter:

* https://www.linkedin.com/in/webai/
* https://x.com/jason_mayes

