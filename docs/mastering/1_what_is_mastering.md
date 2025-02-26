---
sidebar_position: 1
title: What is Mastering?
---

Audio mastering is the final step in the music production process. It ensures your music sounds great across all playback systems, from earbuds to car stereos. Mastering involves:
- Balancing levels
- Enhancing overall sound quality
- Preparing the audio for distribution


## How its done?
### Equalization (EQ) 
Mastering uses EQ to enhance the overall tonal balance of your music, ensuring that frequencies are well-balanced. This means boosting or cutting specific frequency ranges to make your mix sound coherent and polished across different playback systems.

### Compression and Dynamics
Mastering compression evens out the dynamic range, controlling the loudest and quietest parts to maintain a consistent level. This helps in making your music sound good on low-fidelity systems like phones and car stereos.

### Stereo Imaging
Mastering enhances the stereo image to make your mix sound immersive, ensuring that different elements like vocals, instruments, and effects are well-placed in the stereo field. This gives your music a professional and spacious feel. 

Basically, it lets your sound be heard from different sides, front back. 

### Loudness and Limiting:
Mastering maximizes the loudness of your music without causing distortion. Limiters are used to prevent peaks and ensure that your audio doesn't exceed 0 dB, which is essential for digital distribution.

### Sequencing and Track Spacing:
Only relevant if you are making an album, mastering lets you sequence the tracks in the optimal order and setting the appropriate spacing between them to create a cohesive listening experience.


## Why master?
### Consistency Across Playback Systems:
Mastering ensures that your music translates well across different playback devices. What sounds great on professional studio monitors may not sound as good on smaller speakers or headphones without proper mastering. 

Playing your mix in a car is a good way to find out how it sounds on different systems.

### Enhanced Sound Quality
Mastering enhances the overall clarity and definition of your music, making it sound more polished and professional.

### Loudness Optimization
Mastering allows you to maximize the loudness of your music, making it competitive in terms of volume on music streaming platforms and radio. 

While this is widely practiced by the industry and is still an obsession or zeitgeist going around in producer community, these days it is not that important. Streaming services now do loudness normalization, so you don't have to try making it sound louder than your competitors. 

In fact, do not be obsessed over loudness because that is what plugin companies want you to think. 


---

## FAQs:

### What is the difference between mixing and mastering?
Mixing focuses on blending individual tracks into a cohesive mix, adjusting levels, panning, and effects. 

Mastering is the final step that prepares the mixed audio for distribution, ensuring consistency and optimizing loudness.


### Do I need mastering if my mix sounds good?
While a good mix is essential, mastering adds the final touches to ensure your music sounds great across different playback systems and meets distribution standards. Even a well-mixed track can benefit from proper mastering. 

In an ideal environment, your mix is so good that all your mastering does is raising the level until it peaks at 0dB (-0.3db is a safe spot). 

The reason why you don't let your mix get so loud (and hence skipping the mastering step) is because sometimes you want to boost the low-end, mid, or high-end with multi-band compression, or other effects later [^1], and if your mix is too loud you won't be able to reverse those effects. 

It is important to understand the primary objective of mastering is to make the track sound "more like other tracks" created by the industry, on a spectral context.

Don't overthink it.

[^1]: When producers say "leaving some headroom" this is what they meant. Anything above 0db means no more headroom. Anything below 0db means more headroom.

### Can't I just normalize my track instead of mastering?

Normalization increases the overall level of your track to a set peak level. However, it doesn't enhance sound quality or balance frequencies like mastering does. 

Normalization is a basic level adjustment, whereas mastering is a comprehensive process that improves your music's overall sound.

Multiband compression is an obvious advantage of mastering over normalization.


### Can I master my own music?
Yes, you can master your own music with the right tools and knowledge. Ignore the advice that you need a professional because you "don't have what it takes". 

IMO, think the biggest difference between a mastering engineer and a bedroom producer is mostly due to differences in equipment (professional speakers and sound-treated environment are really expensive). 

Todays software is good enough to let a bedroom producer master with normal equipment with good enough results, so again I encourage you not to overthink it.

If you are producing for millions, then it will make more sense to hire a professional mastering engineer.

### Can I master with AI? 
Yes, you can. In fact, there is an open-sourced tool known as [Matchering](https://github.com/sergree/matchering) that provides mastering features. 

From the results, it seems that it is as good as a professional from the 80th percentile **under perfect conditions** [^2].

[^2]: In practice, you will not get perfect conditions unless you blantantly ripoff every part of the reference track, like arrangement, composition, spectral balance (EG: your track has 8b verse, 2b break, 8b chorus, and reference track also followed the `[8,2,8]` arrangement). 

That said, **I do not recommend using AI or Matchering for mastering** if you have no idea what you are doing. 

There is a high chance the AI will give you something that sounds convincing and you just scoop it all up without understanding what it is doing. This is not a good practice. 

You will grow to be dependent on AI and Matchering, they will accidentally give you a horrible master and you will just distribute it carelessly and ruin your reputation.

You should know what you are doing, what you are trying to achieve, and what the AI has done to your mix. However, when you do end up getting to that point, it is also a time when you wouldn't need their help. 

I think AI and Matchering is a good point of reference for beginners to learn what it does to the mix and try to do it yourself. 

### How do I make a good master? 
There is no "good master" except when it sounds good to your ears. But when you are working to make a good master, you should inspect for obvious problems. 

One good way is to do it visually. 

- Load the wave sample for the mix and the reference track into your DAW and check for obvious differences in spectral energy and peaks. 
- If you master's wave ends up looking very close to the reference track, usually it is good enough. 
- There are cases when master wave and reference wave looks similar, but loudness is different. Usually this is a result of a "spectral masking" and "imbalanced EQ, or "upset tonal balance". You may not need to make a decision about it [^3].  

[^3]: Spectral masking and lack of tonal balance are problems that stem **during mixing stage**, so if its really a problem you should fix them before mastering. They can also not be a problem, depending on how you choose to look at it (IE: if that is the sound you are going for).



---