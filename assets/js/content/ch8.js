ML.addChapter({
    id: 8,
    title: 'Deep Learning',
    short: 'Deep Learning',
    lecture: 'Lecture 10',
    color: '#db2777',
    blurb: 'How networks learn, RNNs, LSTM gates and equations, sequence windows and tensors, CNN convolution, stride, padding, pooling, and the classic architectures.',
    outcomes: [
        'Explain deep learning and compare it with traditional ML',
        'Describe RNNs, their hidden state and their limitations',
        'Explain LSTM gates, the cell state and equations; compute a scalar LSTM step',
        'Prepare sequences with sliding windows and 3-D input tensors',
        'Calculate CNN output sizes, parameters, pooling and flattening',
        'Apply concepts to MNIST and CIFAR-10'
    ],
    topics: [
        {
            id: 'foundations', title: 'Deep learning foundations',
            html: String.raw`
<p class="lead">Deep networks can learn complex <strong>non-linear</strong> functions, patterns and representations, which is driving computer vision, audio-visual analysis, chatbots and natural language understanding.</p>
<div class="callout note"><span class="ttl">Bridge from Chapter 7</span>Q-learning estimates Q(s,a) in a table. When there are too many states for a table, a neural network can approximate the Q-values. That is a <strong>Deep Q-Network (DQN)</strong>.</div>

<h3>Traditional ML vs deep learning</h3>
<div class="vs">
<div><h5>Traditional ML</h5><p>Raw data → <strong>explicit, hand-engineered features</strong> → ML predictor → prediction.</p><p class="small">Feature engineering is more explicit (Chapter 3).</p></div>
<div><h5>Deep learning</h5><p>Raw data → <strong>learned layers</strong> (joint feature learning) → prediction.</p><p class="small">Representations are learned <strong>end-to-end</strong>.</p></div>
</div>
<p>Deep learning ⊂ machine learning. <strong>Neither is automatically best for every dataset</strong>: DL usually needs more data and compute, while classical ML often wins on small tabular data.</p>

<h3>The artificial neuron</h3>
$$z=\sum_i w_ix_i+b,\qquad a=f(z)$$

<h3>Activation functions: why non-linearity matters</h3>
<p>Without non-linear activations, stacked linear layers <strong>collapse into one linear transformation</strong>.</p>
<div class="tbl-wrap"><table class="tbl">
<tr><th>Function</th><th>Formula</th><th>Range</th><th>Primary use</th></tr>
<tr><td>Sigmoid</td><td>$\sigma(x)=\frac{1}{1+e^{-x}}$</td><td>0 to 1</td><td>LSTM <strong>gates</strong>; binary output probabilities</td></tr>
<tr><td>tanh</td><td>$\frac{e^x-e^{-x}}{e^x+e^{-x}}$</td><td>−1 to 1</td><td>Zero-centred candidate activations and recurrent states in LSTMs/RNNs</td></tr>
<tr><td>ReLU</td><td>$\max(0,x)$</td><td>0 to ∞</td><td>Default for hidden layers in CNNs and deep MLPs (avoids saturation)</td></tr>
</table></div>
<div class="vis" data-vis="activations"></div>

<h3>How a network learns</h3>
<div class="flow arrows"><span>1 Input batch</span><span>2 Forward pass</span><span>3 Prediction</span><span>4 Compute loss</span><span>5 Backpropagation</span><span>6 Weight update</span></div>
$$W_{new}=W_{old}-\eta\,\frac{\partial L}{\partial W}$$
<div class="cards">
<div class="card"><span class="tag">Epoch</span><p>One pass over the training data</p></div>
<div class="card"><span class="tag">Batch</span><p>A subset of samples per update</p></div>
<div class="card"><span class="tag">Optimiser</span><p>The weight-update rule (SGD, Adam)</p></div>
<div class="card"><span class="tag">Learning rate η</span><p>Controls the update size</p></div>
<div class="card"><span class="tag">Loss L</span><p>Measures error: cross-entropy (classification), MSE (regression)</p></div>
</div>

<h3>The pipeline still applies</h3>
<p>Collect → clean &amp; split → prepare features → train → tune &amp; validate → <strong>test once</strong> → deploy. <strong>Training</strong> data updates weights, <strong>validation</strong> data guides model selection, and <strong>test</strong> data estimates final generalisation. Learn any scaling statistics from training data only.</p>
`
        },
        {
            id: 'rnn', title: 'Recurrent Neural Networks (RNN)',
            html: String.raw`
<p class="lead"><strong>Sequence modelling</strong>: an observation may depend on what happened earlier. Time series (daily weather, equipment sensors, electricity demand) and language ("dog chased cat" ≠ "cat chased dog") both depend on order.</p>

<h3>Sequence task shapes</h3>
<div class="tbl-wrap"><table class="tbl">
<tr><th>Shape</th><th>Example</th><th>Name</th></tr>
<tr><td>One → One</td><td>Image → label</td><td>Standard feed-forward</td></tr>
<tr><td>One → Many</td><td>Prompt/image → sequence (captioning)</td><td>Sequence generation</td></tr>
<tr><td>Many → One</td><td>Sentence → sentiment</td><td>Sequence classification</td></tr>
<tr><td>Many → Many</td><td>Words → word labels / translation</td><td>Sequence translation</td></tr>
</table></div>

<h3>The RNN</h3>
<p>Like an MLP, but with a <strong>feedback loop</strong> that feeds previous time steps into the current one. It uses the <strong>current input</strong> x<sub>t</sub> and the <strong>previous hidden state</strong> h<sub>t−1</sub>. The hidden state is a <strong>running summary</strong> of the sequence so far.</p>
$$h_t=\tanh(W_x x_t + W_h h_{t-1} + b)$$
<p>Unrolled through time, the <strong>same recurrent weights are shared at every time step</strong>. Hidden information flows left to right. Training uses <strong>backpropagation through time (BPTT)</strong>.</p>
<div class="flow arrows"><span>x₁ → h₁ → y₁</span><span>x₂ → h₂ → y₂</span><span>x₃ → h₃ → y₃</span><span>x₄ → h₄ → y₄</span></div>

<div class="callout ex"><span class="ttl">Worked scalar example</span>x<sub>t</sub> = 0.5, W<sub>x</sub> = 0.8, h<sub>t−1</sub> = 0.2, W<sub>h</sub> = 0.5, b = 0.1.<br>z = 0.8(0.5) + 0.5(0.2) + 0.1 = 0.4 + 0.1 + 0.1 = 0.6, so h<sub>t</sub> = tanh(0.6) ≈ <strong>0.537</strong>.</div>

<p><strong>Applications</strong>: weather forecasting, text classification, speech recognition, robot control, language modelling (context → next-token distribution), image captioning. RNNs are one family of sequence models. Attention-based architectures (Transformers) are also widely used.</p>

<h3>Why ordinary RNNs struggle with long sequences</h3>
<p>BPTT multiplies derivatives repeatedly across time steps:</p>
<div class="vs">
<div><h5>Vanishing gradients</h5><p>Gradients shrink towards 0, so early inputs barely influence learning and long-range dependencies are hard to learn. With a repeated factor of 0.5: 1 → 0.5 → 0.25 → 0.125 → 0.0625 → 0.031…</p></div>
<div><h5>Exploding gradients</h5><p>Gradients grow excessively and destabilise training. <strong>Gradient clipping</strong> helps.</p></div>
</div>
<div class="callout ex"><span class="ttl">Example</span>"The <strong>students</strong> who completed several modules in UTP last year <strong>were</strong> happy." A standard RNN may have forgotten the plural subject "students" by the time it reaches the verb "were". LSTMs address this.</div>
`
        },
        {
            id: 'lstm', title: 'Long Short-Term Memory (LSTM)',
            html: String.raw`
<p class="lead">LSTM is an improved RNN designed for <strong>long-range dependencies</strong>. It has an explicit <strong>memory cell state c</strong> surrounded by <strong>gates</strong> that control when information enters memory, when it is forgotten, and when it is output.</p>

<div class="vs">
<div><h5>Basic RNN</h5><p>A single hidden state summarises the past, which makes long-range learning hard.</p></div>
<div><h5>LSTM</h5><p><strong>Cell state c</strong> (long-term memory) + <strong>hidden state h</strong> (working output). Learned gates decide what to retain, add and expose.</p></div>
</div>
<div class="callout key"><span class="ttl">Key point</span>The cell-state update is <strong>additive</strong>, which lets information and gradients flow across many steps. LSTMs <strong>mitigate, rather than eliminate</strong>, the vanishing-gradient problem.</div>

<h3>The gates</h3>
<div class="tbl-wrap"><table class="tbl">
<tr><th>Gate</th><th>Equation</th><th>Role</th></tr>
<tr><td><strong>Forget</strong> f<sub>t</sub></td><td>$f_t=\sigma(W_f x_t+U_f h_{t-1}+b_f)$</td><td>How much of the <strong>previous cell state</strong> to keep (0 = forget, 1 = keep)</td></tr>
<tr><td><strong>Input</strong> i<sub>t</sub></td><td>$i_t=\sigma(W_i x_t+U_i h_{t-1}+b_i)$</td><td>How much candidate content to write</td></tr>
<tr><td>Candidate c̃<sub>t</sub></td><td>$\tilde c_t=\tanh(W_c x_t+U_c h_{t-1}+b_c)$</td><td>Possible new content, in (−1, 1)</td></tr>
<tr><td><strong>Output</strong> o<sub>t</sub></td><td>$o_t=\sigma(W_o x_t+U_o h_{t-1}+b_o)$</td><td>Which parts of the cell to <strong>expose</strong> as h</td></tr>
</table></div>
$$c_t=f_t\odot c_{t-1}+i_t\odot\tilde c_t\qquad\qquad h_t=o_t\odot\tanh(c_t)$$
<p>⊙ = element-wise multiplication. Gates use <strong>sigmoid</strong> (0–1 valves). The candidate and output squashing use <strong>tanh</strong>.</p>
<div class="callout trap"><span class="ttl">Exam trap</span>The output gate does <strong>not</strong> modify the long-term cell state c. It only filters which parts of c become visible as the hidden state h (working memory).</div>

<div class="callout ex"><span class="ttl">Worked LSTM calculation (one scalar cell)</span>
c<sub>t−1</sub> = 0.8, f = 0.9, i = 0.6, c̃ = 0.5, o = 0.7.
<ol><li><strong>Retain</strong>: f × c<sub>t−1</sub> = 0.9 × 0.8 = 0.72</li><li><strong>Add</strong>: i × c̃ = 0.6 × 0.5 = 0.30</li><li><strong>Cell</strong>: c<sub>t</sub> = 0.72 + 0.30 = <strong>1.02</strong></li><li><strong>Hidden</strong>: h<sub>t</sub> = 0.7 × tanh(1.02) ≈ 0.7 × 0.770 ≈ <strong>0.539</strong></li></ol></div>

<div class="vis" data-vis="lstm"></div>

<h3>RNN vs LSTM</h3>
<div class="tbl-wrap"><table class="tbl">
<tr><th></th><th>Basic RNN</th><th>LSTM</th></tr>
<tr><td>Mechanism</td><td>Recurrent hidden state</td><td>Gated cell state + hidden state</td></tr>
<tr><td>Memory handling</td><td>Implicit in hidden state</td><td>Explicit forget/input/output gates</td></tr>
<tr><td>Long-range patterns</td><td>Often harder to train</td><td>Designed to mitigate this</td></tr>
<tr><td>Complexity</td><td>Fewer operations per step</td><td>More parameters and gate operations</td></tr>
<tr><td>Typical use</td><td>Short/moderate sequences</td><td>Longer dependencies, forecasting</td></tr>
</table></div>
<p class="small muted">An LSTM can learn longer-range dependencies more effectively, but it is not guaranteed to outperform an RNN.</p>
`
        },
        {
            id: 'sequences', title: 'Preparing sequences: windows & tensors',
            html: String.raw`
<h3>Four LSTM regression implementation variants</h3>
<div class="cards">
<div class="card"><span class="tag">1 · Basic regression</span><p>Predict continuous targets from a prepared sequence.</p></div>
<div class="card"><span class="tag">2 · Sliding windows</span><p>Convert one series into many input → next-value pairs.</p></div>
<div class="card"><span class="tag">3 · Multiple time steps</span><p>Specify (samples, time steps, features) for the input tensor.</p></div>
<div class="card"><span class="tag">4 · Stateful LSTM</span><p>Carry the recurrent state between aligned batches, and reset it explicitly when needed.</p></div>
</div>
<p class="small muted">Sliding windows and time-step dimensions are related data-preparation choices, not different networks.</p>

<h3>Sliding-window method</h3>
<p>With <strong>window size = 3</strong>, the three prior observations predict the next value. Series: 10, 12, 15, 18, 20, 23.</p>
<div class="tbl-wrap"><table class="tbl"><tr><th>Input window</th><th>Target</th></tr>
<tr><td>10, 12, 15</td><td>18</td></tr><tr><td>12, 15, 18</td><td>20</td></tr><tr><td>15, 18, 20</td><td>23</td></tr></table></div>
<div class="vis" data-vis="window"></div>

<h3>LSTM input tensor: (samples, time steps, features)</h3>
<p><code>X.shape = (100, 5, 3)</code> means <strong>100</strong> independent training sequences, each <strong>5</strong> time steps long, with <strong>3</strong> numeric features measured at every step.</p>
<pre><code>model = Sequential([
    Input(shape=(5, 3)),       # (time steps, features); samples is the batch axis
    LSTM(32),
    Dense(1)                   # regression output
])
model.compile(optimizer="adam", loss="mse")</code></pre>

<h3>Evaluating a forecasting model</h3>
<div class="two">
<div class="card"><h5>MAE</h5>$$\frac1n\sum|y_i-\hat y_i|$$<p class="small">Average absolute error, in the target's units.</p></div>
<div class="card"><h5>RMSE</h5>$$\sqrt{\frac1n\sum(y_i-\hat y_i)^2}$$<p class="small">Penalises large errors more.</p></div>
</div>
<div class="callout trap"><span class="ttl">Forecasting discipline</span><strong>Split chronologically</strong> (train on the past, test on the future, no shuffling). Fit scalers on training data only. Avoid any <strong>future information leakage</strong>.</div>

<details class="check"><summary>Check yourself: a series has 50 values and window size 4. How many training pairs?</summary><div><p>50 − 4 = <strong>46</strong> pairs (each needs 4 inputs plus 1 target).</p></div></details>
`
        },
        {
            id: 'cnn', title: 'CNNs: convolution, stride & padding',
            html: String.raw`
<p class="lead"><strong>Computer vision</strong> makes machines understand high-level patterns in images and video so they can decide as a human would. Tasks: <strong>classification</strong> (one label per image), <strong>detection</strong> (objects + bounding boxes), <strong>segmentation</strong> (per-pixel labels), <strong>style transfer</strong>.</p>

<h3>Datasets</h3>
<div class="tbl-wrap"><table class="tbl"><tr><th>Dataset</th><th>Images</th><th>Classes</th><th>Split</th></tr>
<tr><td>MNIST</td><td>28×28 grayscale handwritten digits</td><td>10 (0–9)</td><td>60,000 / 10,000</td></tr>
<tr><td>CIFAR-10</td><td>32×32 RGB objects</td><td>10</td><td>50,000 / 10,000</td></tr>
<tr><td>ImageNet</td><td>Large natural RGB images</td><td>Many</td><td>Large-scale benchmark</td></tr></table></div>
<p>An RGB image is a tensor of <strong>height × width × 3</strong>, with each pixel channel typically an integer 0–255.</p>

<h3>CNN building blocks (example: a 32×32×3 image)</h3>
<ol class="steps">
<li><strong>Input layer</strong>: raw pixels as a 3-D volume (32×32×3). Preserves spatial structure.</li>
<li><strong>Convolutional layer</strong>: learnable filters (2×2, 3×3, 5×5) slide over the image computing dot products, giving <strong>feature maps</strong> (edges, textures, shapes). 12 filters give 32×32×12.</li>
<li><strong>Activation layer</strong>: element-wise non-linearity (ReLU, tanh, Leaky ReLU). Size unchanged (32×32×12).</li>
<li><strong>Pooling layer</strong>: reduces width/height, keeping depth. 2×2 max pool with stride 2 gives 16×16×12.</li>
<li><strong>Flattening</strong>: 16×16×12 becomes a vector of 3,072.</li>
<li><strong>Fully connected (dense) layer</strong>: high-level reasoning on the extracted features.</li>
<li><strong>Output layer</strong>: sigmoid (binary) or <strong>softmax</strong> (multi-class) probabilities.</li>
</ol>

<h3>How convolution works</h3>
<p>A small <strong>kernel/filter K</strong> slides over the image. At each position it multiplies element-wise with the patch P under it and <strong>sums</strong> the result into one output value. Sliding across the whole image produces the <strong>feature map</strong>. A 3×3 kernel on a 5×5 image with stride 1 shifts <strong>9 times</strong>, giving a 3×3 output.</p>
<div class="vis" data-vis="conv"></div>

<h3>Stride and padding</h3>
<div class="vs">
<div><h5>Stride</h5><p>The step size of the filter. 5×5 input, 3×3 kernel: stride 1 gives 3×3, stride 2 gives 2×2. A larger stride means less computation and resolution, and can lose fine detail.</p></div>
<div><h5>Padding</h5><p><strong>VALID</strong> = no padding, so the output shrinks (5×5 → 3×3). <strong>SAME</strong> = a zero border so that output = input size (5×5 padded to 7×7 → 5×5). Padding keeps border information.</p></div>
</div>
$$\text{Output size}=\left\lfloor\frac{W-F+2P}{S}\right\rfloor+1$$
<p class="small">W = input width, F = filter size, P = padding, S = stride.</p>
<div class="callout note"><span class="ttl">Correction noted in the lecture</span>The original deck said a 6×6 padded input with a 3×3 kernel gives 5×5. It gives <strong>4×4</strong>. SAME padding for a 5×5 input with a 3×3 kernel needs a 1-pixel border, giving 7×7 → 5×5.</div>
<div class="vis" data-vis="convcalc"></div>

<h3>Feature hierarchy</h3>
<div class="flow arrows"><span>Raw pixels<small>intensities</small></span><span>Early layers<small>edges, gradients, colour</small></span><span>Middle layers<small>textures, parts</small></span><span>Later layers<small>complex patterns</small></span><span>Classification<small>object label</small></span></div>

<h3>Why CNNs over plain feed-forward nets?</h3>
<p>A ConvNet captures <strong>spatial (and temporal) dependencies</strong> with relevant filters, using far fewer parameters thanks to <strong>local connections</strong> and <strong>weight sharing</strong>.</p>
<div class="two">
<div class="card"><h5>Dense layer</h5><p>32×32×3 = 3,072 inputs → 100 neurons:</p>$$3072\times100+100=307{,}300$$</div>
<div class="card"><h5>Conv layer</h5><p>32 filters of 3×3×3 + 1 bias each:</p>$$(3\times3\times3+1)\times32=896$$</div>
</div>
<p class="small muted">These are layer parameter counts, not whole-model counts.</p>

<details class="check"><summary>Check yourself: a 7×7 input, 3×3 filter, stride 1, no padding. Output size?</summary><div><p>(7 − 3 + 0)/1 + 1 = <strong>5×5</strong>.</p></div></details>
<details class="check"><summary>Check yourself: 64 filters of 5×5 on an RGB input. How many parameters?</summary><div><p>(5×5×3 + 1) × 64 = 76 × 64 = <strong>4,864</strong>.</p></div></details>
`
        },
        {
            id: 'pooling', title: 'Pooling, ReLU, flatten & softmax',
            html: String.raw`
<h3>Pooling</h3>
<p>Reduces the spatial size of feature maps, which <strong>decreases computation and memory</strong> and helps prevent overfitting. It extracts <strong>dominant features</strong> that are rotation- and position-invariant (giving limited tolerance to small shifts), and has <strong>no learnable weights</strong>.</p>
<div class="vs">
<div><h5>Max pooling</h5><p>Returns the <strong>maximum</strong> in each window. Retains dominant activations and acts as a <strong>noise suppressant</strong> (discards noisy activations).</p></div>
<div><h5>Average pooling</h5><p>Returns the <strong>average</strong> in each window. Captures the mean response, a simpler reduction.</p></div>
</div>
<p class="small">The lecture says max pooling "performs a lot better". Its later slide qualifies this: <strong>neither is universally better</strong>.</p>

<div class="callout ex"><span class="ttl">Worked example: 4×4 input, 2×2 window, stride 2</span>
<div class="mat-row">
<div><span class="lab">Input</span><div class="grid-mat" style="grid-template-columns:repeat(4,auto)"><span class="on">12</span><span class="on">20</span><span>30</span><span>0</span><span class="on">8</span><span class="on">12</span><span>2</span><span>0</span><span>34</span><span>70</span><span>37</span><span>4</span><span>112</span><span>100</span><span>25</span><span>12</span></div></div>
<div><span class="lab">Max</span><div class="grid-mat" style="grid-template-columns:repeat(2,auto)"><span class="out">20</span><span class="out">30</span><span class="out">112</span><span class="out">37</span></div></div>
<div><span class="lab">Average</span><div class="grid-mat" style="grid-template-columns:repeat(2,auto)"><span class="out">13</span><span class="out">8</span><span class="out">79</span><span class="out">19.5</span></div></div>
</div>
<p class="small">Top-left window {12, 20, 8, 12}: max 20, average 52/4 = 13.</p></div>

<div class="vis" data-vis="pool"></div>

<h3>ReLU in CNNs</h3>
<p>$\text{ReLU}(z)=\max(0,z)$: negatives become 0 and positives are unchanged.</p>
<div class="mat-row"><div><span class="lab">Before</span><div class="grid-mat" style="grid-template-columns:repeat(3,auto)"><span>-3</span><span>2</span><span>5</span><span>-1</span><span>-4</span><span>1</span><span>0</span><span>6</span><span>-2</span></div></div><div><span class="lab">After ReLU</span><div class="grid-mat" style="grid-template-columns:repeat(3,auto)"><span class="out">0</span><span class="out">2</span><span class="out">5</span><span class="out">0</span><span class="out">0</span><span class="out">1</span><span class="out">0</span><span class="out">6</span><span class="out">0</span></div></div></div>

<h3>Flattening</h3>
<p>Converts multi-dimensional feature maps into one <strong>1-D vector</strong> for the dense layer. <strong>It doesn't change the values, only their arrangement.</strong></p>
<div class="callout ex"><span class="ttl">Tracking tensor shapes</span>
<div class="flow arrows"><span>Input<small>32×32×1</small></span><span>5×5 conv, 3 filters<small>28×28×3</small></span><span>2×2 pool<small>14×14×3</small></span><span>Flatten<small>588</small></span><span>Dense<small>20 units</small></span><span>Output<small>5 classes</small></span></div>
32 − 5 + 1 = 28. 28/2 = 14. 14 × 14 × 3 = <strong>588</strong>. The final layer must match the task: MNIST and CIFAR-10 each need <strong>10</strong> outputs.</div>

<h3>Fully connected layer and softmax</h3>
<p>Every neuron connects to every neuron in the previous layer. It combines the extracted features to predict the class. <strong>Softmax</strong> turns raw scores into probabilities that sum to 1:</p>
$$\text{softmax}(z_i)=\frac{e^{z_i}}{\sum_j e^{z_j}}$$
<p>Predict the class with the largest probability (e.g. 5%, 10%, <strong>70%</strong>, 10%, 5% gives Class 3). <strong>Cross-entropy loss</strong> penalises probability assigned away from the true class.</p>
<div class="vis" data-vis="softmax"></div>
`
        },
        {
            id: 'architectures', title: 'CNN architectures, MNIST & CIFAR-10',
            html: String.raw`
<h3>Milestone architectures</h3>
<div class="tbl-wrap"><table class="tbl">
<tr><th>Year</th><th>Network</th><th>Contribution</th></tr>
<tr><td>1990s</td><td><strong>LeNet</strong> (Yann LeCun)</td><td>First successful CNNs: read zip codes and digits with convolution + subsampling</td></tr>
<tr><td>2012</td><td><strong>AlexNet</strong> (Krizhevsky, Sutskever, Hinton)</td><td>Popularised CNNs in vision. Won ILSVRC 2012 with 16% top-5 error vs 26% for the runner-up. Deeper and bigger, with stacked conv layers, ReLU and GPU training</td></tr>
<tr><td>2013</td><td><strong>ZFNet</strong> (Zeiler &amp; Fergus)</td><td>ILSVRC 2013 winner. Tuned AlexNet: bigger middle conv layers, smaller first-layer stride and filter size. Helped visualise learned features</td></tr>
<tr><td>2014</td><td><strong>GoogLeNet</strong> (Szegedy et al.)</td><td>ILSVRC 2014 winner. The <strong>Inception module</strong> processes several receptive-field sizes in parallel. 4M parameters vs AlexNet's 60M. Average pooling instead of FC layers at the top</td></tr>
<tr><td>2014</td><td><strong>VGGNet</strong> (Simonyan &amp; Zisserman)</td><td>Runner-up 2014. Showed that <strong>depth is critical</strong>: 16 CONV/FC layers, only 3×3 convolutions and 2×2 pooling throughout</td></tr>
<tr><td>2015</td><td><strong>ResNet</strong> (Kaiming He et al.)</td><td>ILSVRC 2015 winner. <strong>Residual skip connections</strong> output F(x) + x, plus heavy batch normalisation. Made very deep networks trainable</td></tr>
</table></div>
<p class="small muted">Study these as milestones, not as claims of current state-of-the-art performance.</p>

<h3>MNIST: handwritten digits</h3>
<p>28×28 grayscale, 60,000 train / 10,000 test, 10 classes.</p>
<pre><code>from tensorflow.keras import Sequential
from tensorflow.keras.layers import Input, Conv2D, MaxPooling2D, Flatten, Dense

model = Sequential([
    Input(shape=(28, 28, 1)),
    Conv2D(16, 3, activation="relu"),    # -> 26x26x16
    MaxPooling2D(2),                     # -> 13x13x16
    Conv2D(32, 3, activation="relu"),    # -> 11x11x32
    Flatten(),                           # -> 3872
    Dense(64, activation="relu"),
    Dense(10, activation="softmax")      # 10 digit probabilities
])
model.compile(optimizer="adam", loss="sparse_categorical_crossentropy", metrics=["accuracy"])</code></pre>
<ol class="steps"><li><strong>Normalise</strong>: map pixel values to [0, 1] (divide by 255).</li><li><strong>Train</strong>: fit only on training images.</li><li><strong>Validate</strong>: monitor loss and accuracy.</li><li><strong>Test</strong>: evaluate <strong>once</strong> on the test set.</li></ol>
<p>Accuracy = correct predictions / all predictions. Also inspect a <strong>confusion matrix</strong> and the misclassified digits, not just one score.</p>

<h3>CIFAR-10: ten object classes</h3>
<p>Airplane, automobile, bird, cat, deer, dog, frog, horse, ship, truck. 32×32×3, 50,000 train / 10,000 test. Collected by Krizhevsky, Nair and Hinton. It is harder than MNIST because of low resolution, varied backgrounds and similar-looking classes (cat vs dog).</p>
<div class="cards">
<div class="card"><span class="tag">Preprocess</span><p>Normalise RGB and keep a validation subset</p></div>
<div class="card"><span class="tag">Augment</span><p>Flips, translations, mild colour changes</p></div>
<div class="card"><span class="tag">Regularise</span><p>Dropout, early stopping, weight regularisation</p></div>
<div class="card"><span class="tag">Evaluate</span><p>Track loss/accuracy and inspect per-class errors</p></div>
</div>

<h3>Summary: RNN, LSTM and CNN side by side</h3>
<div class="tbl-wrap"><table class="tbl">
<tr><th></th><th>RNN</th><th>LSTM</th><th>CNN</th></tr>
<tr><td>Main data</td><td>Ordered sequences</td><td>Ordered sequences</td><td>Spatial image data</td></tr>
<tr><td>Core mechanism</td><td>Recurrent hidden state</td><td>Gated cell state</td><td>Shared convolution filters</td></tr>
<tr><td>Key strength</td><td>Temporal context</td><td>Longer dependencies</td><td>Local spatial representations</td></tr>
<tr><td>Example</td><td>Sequence prediction</td><td>Temperature forecasting</td><td>Image classification</td></tr>
</table></div>
<div class="callout key"><span class="ttl">Three big ideas</span><strong>RNN</strong>: sequence context through a hidden state. <strong>LSTM</strong>: gated memory (forget, input, output). <strong>CNN</strong>: local trainable filters extract spatial features. Model quality depends on data, architecture, training and evaluation, not just depth.</div>
`
        }
    ],
    notes: String.raw`
<h3>1. Foundations</h3>
<p>Traditional ML uses hand-engineered features. Deep learning learns representations end-to-end. Neuron: z = Σwx + b, a = f(z). Activations: sigmoid (0–1; gates and binary output), tanh (−1–1; candidate and recurrent states), ReLU (max(0,x); hidden layers). Without non-linearity, the layers collapse into one linear map. Training loop: batch → forward → loss → backprop → update $W\leftarrow W-\eta\,\partial L/\partial W$. Epoch, batch, optimiser, learning rate, loss (cross-entropy/MSE). Train/validation/test roles, with no leakage. DQN = a neural network approximating Q-values.</p>

<h3>2. RNN</h3>
<p>Sequences where order matters. Task shapes: one-one, one-many, many-one, many-many. $h_t=\tanh(W_xx_t+W_hh_{t-1}+b)$ with weights shared over time, trained with BPTT. Example: 0.4 + 0.1 + 0.1 = 0.6, so tanh gives 0.537. Problems: vanishing gradients (long-range dependencies lost) and exploding gradients (use clipping).</p>

<h3>3. LSTM</h3>
<p>Cell state c plus hidden state h. Gates (sigmoid): forget f, input i, output o. Candidate c̃ uses tanh. $c_t=f\odot c_{t-1}+i\odot\tilde c$, $h_t=o\odot\tanh(c_t)$. The additive update mitigates vanishing gradients. The output gate doesn't change c. Example: 0.9×0.8 + 0.6×0.5 = 1.02, and h = 0.7×tanh(1.02) ≈ 0.539.</p>

<h3>4. Sequence preparation</h3>
<p>Sliding windows (window 3: [10,12,15] → 18). Tensor (samples, time steps, features), e.g. (100, 5, 3). Variants: basic, windows, multiple time steps, stateful. Evaluate with MAE and RMSE. Split chronologically and fit scalers on train only.</p>

<h3>5. CNN</h3>
<p>Input → conv (filters → feature maps) → activation → pooling → flatten → dense → output (softmax). Output size = ⌊(W − F + 2P)/S⌋ + 1. VALID = no padding, SAME = keep the size. Stride 1 vs 2 on 5×5 with 3×3 gives 3×3 vs 2×2. Parameters: (F·F·C + 1) × K, so 896 for a conv vs 307,300 for a dense layer. Feature hierarchy runs from edges to textures to parts to objects.</p>

<h3>6. Pooling, flatten, softmax</h3>
<p>Max pooling keeps the largest value (dominant activations, noise suppression). Average pooling keeps the mean. No weights. 4×4 example: max [20,30;112,37], average [13,8;79,19.5]. ReLU zeroes negatives. Flatten only rearranges (14×14×3 = 588). Softmax = e^{z_i}/Σe^{z_j}, with cross-entropy loss.</p>

<h3>7. Architectures & applications</h3>
<p>LeNet (1990s, digits) → AlexNet (2012, ReLU, GPU, 16% vs 26%) → ZFNet (2013) → GoogLeNet (2014, Inception, 4M parameters) → VGGNet (2014, depth, 3×3) → ResNet (2015, skip connections F(x)+x). MNIST: 28×28×1, 60k/10k, 10 classes. CIFAR-10: 32×32×3, 50k/10k, 10 classes. Normalise, augment, regularise, and evaluate with a confusion matrix.</p>
`,
    subjective: [
        { q: 'Compare traditional machine learning with deep learning in terms of how features are obtained.', m: 4, a: String.raw`<p><strong>Traditional ML</strong>: raw data is turned into explicit, hand-engineered features by humans using domain knowledge (Chapter 3 techniques), which are then fed to a predictor such as an SVM or random forest.</p><p><strong>Deep learning</strong>: raw data (pixels, word tokens, signals) is fed into a network whose stacked layers <em>learn</em> the representations jointly with the predictor, end-to-end. Early layers learn simple features and later layers learn complex ones.</p><p>Deep learning is a subset of ML. It typically needs more data and compute, and neither approach is automatically best for every dataset.</p>` },
        { q: 'Explain how an RNN processes a sequence and why ordinary RNNs struggle with long sequences.', m: 6, a: String.raw`<p>An RNN processes one time step at a time. At step t it combines the current input x<sub>t</sub> with the previous hidden state h<sub>t−1</sub>: $h_t=\tanh(W_xx_t+W_hh_{t-1}+b)$. The hidden state acts as a running summary of everything seen so far. The same weights are shared across all time steps (unrolled through time), and training uses backpropagation through time.</p><p>On long sequences, BPTT multiplies many derivatives together. If they are less than 1, the gradient <strong>vanishes</strong> (e.g. 0.5ⁿ → 0), so early inputs barely affect learning and long-range dependencies are lost. For example, the RNN forgets the subject "students" by the time it reaches "were". If the derivatives are greater than 1, the gradient <strong>explodes</strong> and destabilises training (mitigated by gradient clipping).</p>` },
        { q: 'Describe the three gates of an LSTM and the cell-state update. Compute c_t and h_t given c_{t−1} = 0.8, f = 0.9, i = 0.6, c̃ = 0.5, o = 0.7.', m: 8, a: String.raw`<ul><li><strong>Forget gate</strong> $f_t=\sigma(W_fx_t+U_fh_{t-1}+b_f)$: how much of the previous cell state to keep (0–1).</li><li><strong>Input gate</strong> $i_t=\sigma(\cdot)$ with candidate $\tilde c_t=\tanh(\cdot)$: how much new candidate content to write into memory.</li><li><strong>Output gate</strong> $o_t=\sigma(\cdot)$: which parts of the cell state to expose as the hidden state. It does not modify c.</li></ul><p>Update: $c_t=f_t\odot c_{t-1}+i_t\odot\tilde c_t$ and $h_t=o_t\odot\tanh(c_t)$. The additive update helps gradients flow, which mitigates vanishing gradients.</p><p><strong>Calculation</strong>: c<sub>t</sub> = 0.9×0.8 + 0.6×0.5 = 0.72 + 0.30 = <strong>1.02</strong>. h<sub>t</sub> = 0.7 × tanh(1.02) ≈ 0.7 × 0.770 = <strong>0.539</strong>.</p>` },
        { q: 'Explain the sliding-window method for time series and the meaning of an LSTM input of shape (100, 5, 3).', m: 5, a: String.raw`<p><strong>Sliding window</strong>: convert one series into supervised input → target pairs by taking a fixed number of past observations to predict the next one. With window 3 and the series 10, 12, 15, 18, 20, 23: [10,12,15] → 18, [12,15,18] → 20, [15,18,20] → 23.</p><p><strong>Shape (100, 5, 3)</strong> = (samples, time steps, features): 100 independent training sequences, each 5 time steps long, with 3 numeric features measured at every time step.</p>` },
        { q: 'Calculate the output size for: (a) 7×7 input, 3×3 filter, stride 1, no padding; (b) 32×32 input, 5×5 filter, stride 1, padding 2; (c) 28×28 input, 2×2 max pool, stride 2.', m: 6, a: String.raw`<p>Using $\lfloor (W-F+2P)/S\rfloor+1$:</p><p>(a) (7 − 3 + 0)/1 + 1 = <strong>5×5</strong>.</p><p>(b) (32 − 5 + 4)/1 + 1 = <strong>32×32</strong> (SAME padding).</p><p>(c) (28 − 2 + 0)/2 + 1 = <strong>14×14</strong>.</p>` },
        { q: 'Why do CNNs use far fewer parameters than dense networks on images? Support your answer with a calculation.', m: 5, a: String.raw`<p>CNNs use <strong>local connectivity</strong> (each neuron looks at a small patch) and <strong>weight sharing</strong> (the same small filter is reused at every location). A dense layer connects every pixel to every neuron.</p><p>For a 32×32×3 image (3,072 inputs): a dense layer with 100 neurons needs 3,072 × 100 + 100 = <strong>307,300</strong> parameters. A conv layer with 32 filters of 3×3×3 needs (3×3×3 + 1) × 32 = <strong>896</strong> parameters. CNNs also capture spatial dependencies that flattening the image into an MLP would destroy.</p>` },
        { q: 'Compare max pooling and average pooling. Apply both (2×2, stride 2) to [[12,20,30,0],[8,12,2,0],[34,70,37,4],[112,100,25,12]].', m: 6, a: String.raw`<p><strong>Max pooling</strong> outputs the maximum of each window. It retains the dominant activations and suppresses noise. <strong>Average pooling</strong> outputs the mean of each window, capturing the average response. Both reduce spatial size, have no weights, and give some tolerance to small shifts. Neither is universally better.</p><p>Windows: {12,20,8,12}, {30,0,2,0}, {34,70,112,100}, {37,4,25,12}.</p><p>Max: [[20, 30], [112, 37]]. Average: [[13, 8], [79, 19.5]].</p>` },
        { q: 'Describe the layers of a CNN for classifying CIFAR-10 images, tracking how the tensor shape changes.', m: 6, a: String.raw`<p>Input 32×32×3 → <strong>Conv</strong> (e.g. 32 filters 3×3, SAME) → 32×32×32 feature maps → <strong>ReLU</strong> (shape unchanged) → <strong>Max pool</strong> 2×2 stride 2 → 16×16×32 → another conv + ReLU + pool (e.g. 64 filters) → 8×8×64 → <strong>Flatten</strong> → 4,096-vector (values unchanged, only rearranged) → <strong>Dense</strong> layer(s) (e.g. 128 ReLU) combine the features → <strong>Output</strong> dense layer with <strong>10</strong> units and <strong>softmax</strong>, giving class probabilities that sum to 1. Train with cross-entropy loss. Normalise inputs, use augmentation and dropout, and evaluate on the test set with a confusion matrix.</p>` },
        { q: 'Briefly describe the contributions of AlexNet, VGGNet and ResNet.', m: 6, a: String.raw`<p><strong>AlexNet (2012)</strong>: popularised CNNs in computer vision by winning ILSVRC 2012 with 16% top-5 error vs 26% for the runner-up. Deeper and bigger than LeNet, with stacked conv layers, ReLU and GPU training.</p><p><strong>VGGNet (2014)</strong>: showed that network <strong>depth</strong> is critical, with 16 CONV/FC layers in a homogeneous design using only 3×3 convolutions and 2×2 pooling.</p><p><strong>ResNet (2015)</strong>: introduced <strong>residual skip connections</strong> (output F(x) + x) and heavy batch normalisation, making very deep networks trainable. It won ILSVRC 2015.</p>` }
    ],
    mcq: [
        { q: 'The main distinction between traditional ML and deep learning is:', o: ['Deep learning cannot do classification', 'How task-relevant features are obtained: hand-engineered vs learned end-to-end', 'Traditional ML always needs more data', 'Deep learning does not use weights'], a: 1, e: 'Deep learning learns representations jointly with the predictor.' },
        { q: 'Without non-linear activation functions, stacked linear layers:', o: ['Become a decision tree', 'Collapse into one linear transformation', 'Cannot be trained', 'Become an RNN'], a: 1, e: 'A composition of linear maps is linear.' },
        { q: 'Which activation is the default for CNN hidden layers?', o: ['Sigmoid', 'tanh', 'ReLU', 'Softmax'], a: 2, e: 'ReLU avoids saturation.' },
        { q: 'LSTM gates use which activation to produce values between 0 and 1?', o: ['ReLU', 'Sigmoid', 'tanh', 'Linear'], a: 1, e: 'Sigmoid acts as a 0–1 valve. The candidate uses tanh.' },
        { q: 'The output range of tanh is:', o: ['0 to 1', '−1 to 1', '0 to ∞', '−∞ to ∞'], a: 1, e: 'It is zero-centred.' },
        { q: 'One complete pass over the training data is called:', o: ['A batch', 'An epoch', 'A step', 'A kernel'], a: 1, e: 'A batch is a subset used for one update.' },
        { q: 'An RNN computes its hidden state from:', o: ['Only the current input', 'The current input and the previous hidden state', 'Only the output', 'A random vector'], a: 1, e: 'h_t = tanh(W_x x_t + W_h h_{t−1} + b).' },
        { q: 'x = 0.5, W_x = 0.8, h_prev = 0.2, W_h = 0.5, b = 0.1. The pre-activation z is:', o: ['0.5', '0.6', '0.7', '1.0'], a: 1, e: '0.4 + 0.1 + 0.1 = 0.6, and tanh(0.6) ≈ 0.537.' },
        { q: 'Sentence → sentiment label is which sequence task shape?', o: ['One to one', 'One to many', 'Many to one', 'Many to many'], a: 2, e: 'This is sequence classification.' },
        { q: 'The main reason ordinary RNNs struggle with long sequences is:', o: ['Too few parameters', 'Vanishing (or exploding) gradients', 'They cannot use tanh', 'They need images'], a: 1, e: 'Repeated multiplication of derivatives during BPTT.' },
        { q: 'Exploding gradients can be mitigated by:', o: ['Gradient clipping', 'Removing the bias', 'Using max pooling', 'Increasing the learning rate'], a: 0, e: 'Clipping caps the gradient magnitude.' },
        { q: 'In an LSTM, the forget gate controls:', o: ['How much new content is written', 'How much of the previous cell state is retained', 'What is exposed as output', 'The learning rate'], a: 1, e: 'f × c_{t−1}.' },
        { q: 'Which statement about the LSTM output gate is TRUE?', o: ['It erases the cell state', 'It filters which parts of the cell state become the hidden state h, without modifying c', 'It writes new memory', 'It uses ReLU'], a: 1, e: 'h_t = o_t ⊙ tanh(c_t).' },
        { q: 'c_{t−1} = 0.8, f = 0.9, i = 0.6, c̃ = 0.5. The new cell state c_t is:', o: ['0.72', '0.30', '1.02', '0.539'], a: 2, e: '0.72 + 0.30 = 1.02.' },
        { q: 'LSTMs address the vanishing gradient problem by:', o: ['Eliminating it completely', 'Mitigating it with an additive, gated cell-state update', 'Removing recurrence', 'Using pooling'], a: 1, e: 'They mitigate rather than eliminate it.' },
        { q: 'With window size 3, the series 10, 12, 15, 18 gives which training pair?', o: ['[10,12] → 15', '[10,12,15] → 18', '[12,15,18] → 10', '[10] → 12'], a: 1, e: 'Three past values predict the next one.' },
        { q: 'LSTM input X.shape = (100, 5, 3). The 5 refers to:', o: ['Samples', 'Time steps', 'Features', 'Classes'], a: 1, e: 'The order is (samples, time steps, features).' },
        { q: 'For time-series forecasting, the data should be split:', o: ['Randomly with shuffling', 'Chronologically', 'By class label', 'Alphabetically'], a: 1, e: 'This avoids future information leaking into training.' },
        { q: 'A 7×7 input with a 3×3 filter, stride 1 and no padding gives an output of:', o: ['3×3', '4×4', '5×5', '7×7'], a: 2, e: '(7 − 3)/1 + 1 = 5.' },
        { q: 'A 5×5 input with a 3×3 kernel at stride 2 (no padding) gives:', o: ['3×3', '2×2', '1×1', '4×4'], a: 1, e: '(5 − 3)/2 + 1 = 2.' },
        { q: '"SAME" padding means:', o: ['No padding, so the output shrinks', 'Zero-padding so that the output size equals the input size (stride 1)', 'Padding with the same pixel values', 'Using the same filter twice'], a: 1, e: 'VALID means no padding.' },
        { q: 'Parameters in a conv layer with 32 filters of size 3×3 on an RGB input:', o: ['288', '864', '896', '307,300'], a: 2, e: '(3×3×3 + 1) × 32 = 896.' },
        { q: 'CNNs use fewer parameters than dense layers on images mainly because of:', o: ['Softmax', 'Local connectivity and weight sharing', 'Pooling only', 'Larger learning rates'], a: 1, e: 'The same small filter is reused everywhere.' },
        { q: 'Max pooling 2×2 on the window {12, 20, 8, 12} gives:', o: ['13', '20', '52', '8'], a: 1, e: 'Average pooling would give 13.' },
        { q: 'Pooling layers:', o: ['Have many learnable weights', 'Reduce width/height and keep depth, with no learnable weights', 'Increase the spatial size', 'Replace activation functions'], a: 1, e: 'For example, 32×32×12 → 16×16×12.' },
        { q: 'Flattening a 14×14×3 feature map produces a vector of length:', o: ['42', '196', '588', '3072'], a: 2, e: '14 × 14 × 3 = 588.' },
        { q: 'Flattening:', o: ['Changes the values', 'Only rearranges values into a 1-D vector', 'Applies ReLU', 'Reduces the number of values by half'], a: 1, e: 'The values are unchanged.' },
        { q: 'Softmax outputs:', o: ['Values between −1 and 1', 'Probabilities over classes that sum to 1', 'Only 0 or 1', 'Feature maps'], a: 1, e: 'softmax(z_i) = e^{z_i}/Σe^{z_j}.' },
        { q: 'Early convolutional layers typically learn:', o: ['Whole objects', 'Edges and gradients (low-level features)', 'Class labels', 'Text tokens'], a: 1, e: 'The hierarchy runs from edges to textures to parts to objects.' },
        { q: 'Which architecture introduced residual skip connections?', o: ['LeNet', 'AlexNet', 'VGGNet', 'ResNet'], a: 3, e: 'ResNet (2015): F(x) + x.' },
        { q: 'GoogLeNet\'s main contribution was:', o: ['Residual connections', 'The Inception module, with far fewer parameters (4M vs 60M)', 'Only 3×3 convolutions', 'Reading zip codes'], a: 1, e: 'It also used average pooling instead of FC layers at the top.' },
        { q: 'VGGNet showed that:', o: ['Depth is a critical component for performance', 'Pooling is unnecessary', 'RNNs beat CNNs on images', 'Large 11×11 filters are best'], a: 0, e: '16 layers, using only 3×3 convolutions and 2×2 pooling.' },
        { q: 'MNIST images are:', o: ['32×32 RGB', '28×28 grayscale', '224×224 RGB', '64×64 grayscale'], a: 1, e: '60,000 training and 10,000 test images, 10 digit classes.' },
        { q: 'CIFAR-10 contains:', o: ['10 classes of 32×32 RGB images (50,000 train / 10,000 test)', 'Handwritten digits', '1000 classes', 'Grayscale faces'], a: 0, e: 'Airplane, automobile, bird, cat, deer, dog, frog, horse, ship, truck.' },
        { q: 'A neural network approximating Q-values (linking RL to deep learning) is a:', o: ['CNN', 'Deep Q-Network (DQN)', 'LSTM', 'ResNet'], a: 1, e: 'It is used when the state space is too large for a Q-table.' }
    ]
});
