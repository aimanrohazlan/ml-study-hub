ML.addChapter({
    id: 7,
    title: 'Reinforcement Learning',
    short: 'Reinforcement Learning',
    lecture: 'Lecture 9',
    color: '#d97706',
    blurb: 'Agents, environments, states, actions and rewards; policies, exploration vs exploitation; Q-learning, the Bellman equation and the Taxi-v3 case study.',
    outcomes: [
        'Explain reinforcement learning and how it differs from supervised and unsupervised learning',
        'Identify the agent, environment, state, action, reward, policy and episode in a scenario',
        'Explain exploration vs exploitation and the ε-greedy strategy',
        'Apply the Bellman / Q-learning update equation numerically',
        'Describe the Q-table and the Taxi-v3 environment (states, actions, rewards)'
    ],
    topics: [
        {
            id: 'fundamentals', title: 'RL fundamentals',
            html: String.raw`
<p class="lead">Reinforcement learning is a <strong>goal-oriented</strong> method based on <strong>interaction with an environment</strong>. An <strong>agent</strong> (an intelligent program) acts in an <strong>environment</strong> (the external conditions) to <strong>maximise its rewards</strong>.</p>

<div class="tbl-wrap"><table class="tbl">
<tr><th></th><th>Supervised</th><th>Unsupervised</th><th>Reinforcement</th></tr>
<tr><td>Data</td><td>Labelled (x, y)</td><td>Unlabelled x</td><td>No fixed dataset. Experience comes from interaction</td></tr>
<tr><td>Feedback</td><td>Correct answer</td><td>None</td><td><strong>Reward / penalty</strong>, often delayed</td></tr>
<tr><td>Goal</td><td>Predict y</td><td>Find structure</td><td>Learn actions that maximise <strong>long-term</strong> reward</td></tr>
<tr><td>Style</td><td>Static pipeline</td><td>Static pipeline</td><td><strong>Active interaction</strong>, sequential decisions</td></tr>
</table></div>
<p>RL needs <strong>no labelled data</strong> and works well with <strong>less historical data</strong>. It uses a <strong>value function</strong> calculated on the basis of the <strong>policy</strong> chosen for each action. It suits <strong>sequential decision-making</strong> problems that need long-term planning: games, robotics, self-driving, recommendation.</p>

<h3>Main components</h3>
<div class="cards">
<div class="card"><span class="tag">Agent</span><p>The learner and decision-maker.</p></div>
<div class="card"><span class="tag">Environment</span><p>Everything the agent interacts with.</p></div>
<div class="card"><span class="tag">State (s)</span><p>The current situation or position of the agent.</p></div>
<div class="card"><span class="tag">Action (a)</span><p>A move the agent makes, which transitions it from one state to another.</p></div>
<div class="card"><span class="tag">Reward (r)</span><p>Feedback after an action: positive (treat) or negative (penalty).</p></div>
<div class="card"><span class="tag">Policy (π)</span><p>The strategy that maps states to actions in expectation of better outcomes.</p></div>
<div class="card"><span class="tag">Episode</span><p>A complete run that ends in a terminal state, after which no new action can be taken.</p></div>
</div>

<div class="vis" data-vis="rlloop"></div>

<h3>Analogy: training a dog</h3>
<ul>
<li>The <strong>dog</strong> is the agent. Your <strong>house, with you</strong>, is the environment.</li>
<li>The dog standing while you say a word in a certain tone is a <strong>state</strong>.</li>
<li>Going from standing to sitting is an <strong>action</strong> (a state transition).</li>
<li>A treat is a <strong>reward</strong>, and "No" is a <strong>penalty</strong>.</li>
<li>The dog's strategy for choosing actions is its <strong>policy</strong>.</li>
</ul>
<p>The agent moves from state $s_t$ to $s_{t+1}$ and learns a behaviour function that maps states to actions so as to maximise the <strong>expected sum of discounted rewards</strong>.</p>

<div class="callout key"><span class="ttl">The credit assignment problem</span>When a reward is <strong>delayed</strong>, which earlier actions were responsible for the success? The dog must remember what earned the reward. In chess, the winning move may have been made 30 moves earlier.</div>

<h3>Example: a shooter video game</h3>
<p>Agent = the soldier. States = what's on screen. Episode = a complete game. Actions = forward, back, left, right, jump, duck, shoot. Rewards = positive for killing an enemy, negative for getting shot.</p>

<details class="check"><summary>Check yourself: a robot vacuum gets +1 for each dirt patch cleaned and −10 for hitting stairs. Name the agent, a state, an action and a reward.</summary><div><p>Agent: the vacuum. State: its position plus its sensor readings. Action: move forward, turn left, etc. Reward: +1 for cleaning, −10 for a fall.</p></div></details>
`
        },
        {
            id: 'policy', title: 'Policies, exploration & ε-greedy',
            html: String.raw`
<h3>Policy π</h3>
<p>The agent's <strong>strategy</strong>: a mapping from states to actions, $\pi(s) \rightarrow a$. Learning in RL means finding a policy that maximises long-term reward. The <strong>optimal policy</strong> picks, in each state, the action with the highest cumulative long-term reward.</p>

<h3>Exploration vs exploitation</h3>
<div class="vs">
<div><h5>Exploration</h5><p>Try <strong>new or random</strong> actions to <strong>discover</strong> potentially better rewards.</p><p class="small">Too much: the agent never uses what it knows.</p></div>
<div><h5>Exploitation</h5><p>Choose the <strong>best known</strong> action (highest Q-value) to <strong>collect</strong> reward.</p><p class="small">Too much: it gets stuck on a sub-optimal habit.</p></div>
</div>
<div class="callout ex"><span class="ttl">Analogy</span>Always ordering your favourite dish is exploitation. Trying a new restaurant is exploration. You might find something better, or waste a meal.</div>

<h3>ε-greedy strategy</h3>
$$a=\begin{cases}\text{random action} & \text{with probability } \varepsilon\ \ (\text{explore})\\ \arg\max_a Q(s,a) & \text{with probability } 1-\varepsilon\ \ (\text{exploit})\end{cases}$$
<p>ε is often started high (e.g. 1.0) and <strong>decayed</strong> over training, so the agent explores early and exploits once its Q-values are reliable.</p>
<pre><code>if random.uniform(0, 1) < epsilon:
    action = env.action_space.sample()      # explore
else:
    action = np.argmax(q_table[state])      # exploit</code></pre>

<h3>Off-policy vs on-policy</h3>
<div class="vs">
<div><h5>Off-policy (Q-learning)</h5><p>Learns the value of the <strong>greedy/optimal</strong> policy (the max in the update) while <strong>behaving</strong> with a different, exploratory policy (ε-greedy). Behaviour and learning target are decoupled.</p></div>
<div><h5>On-policy (e.g. SARSA)</h5><p>Learns the value of the <strong>same</strong> policy it uses to act, exploration included.</p></div>
</div>

<details class="check"><summary>Check yourself: ε = 0.1 and the best known action is "right". How often does the agent choose "right"?</summary><div><p>About 90% via exploitation, plus a further share whenever the random exploration also happens to pick "right". With 4 actions that's 0.9 + 0.1 × ¼ = <strong>92.5%</strong>.</p></div></details>
`
        },
        {
            id: 'qlearning', title: 'Q-learning & the Bellman equation',
            html: String.raw`
<p class="lead">Q-learning is a <strong>model-free, off-policy, value-based</strong> RL algorithm that learns the <strong>quality (Q)</strong> of actions: which action to take in which state.</p>
<ul>
<li><strong>Model-free</strong>: it needs no model of the environment's dynamics. It learns from experienced transitions by updating the value function with the Q equation.</li>
<li><strong>Off-policy</strong>: it may act outside the policy it is learning (random exploratory actions), so it has no real need for a fixed policy.</li>
<li>It finds an <strong>optimal policy</strong> that maximises the expected total reward over all successive steps from the current state.</li>
</ul>

<h3>Key terms</h3>
<div class="tbl-wrap"><table class="tbl">
<tr><td><strong>States (S)</strong></td><td>The agent's current position in the environment</td></tr>
<tr><td><strong>Action (A)</strong></td><td>The step taken in a particular state</td></tr>
<tr><td><strong>Rewards</strong></td><td>Positive or negative feedback for every action</td></tr>
<tr><td><strong>Episodes</strong></td><td>End when the agent reaches a terminating state</td></tr>
<tr><td><strong>Q-values</strong></td><td>Q(S, A): how good action A is in state S, i.e. the expected future reward</td></tr>
<tr><td><strong>Temporal Difference</strong></td><td>Updates Q using the current state/action and the next state's estimated value</td></tr>
</table></div>

<h3>Bellman optimality equation</h3>
<p>Determines the value of a state, i.e. how good it is to be in that state. It uses the immediate reward plus the <strong>discounted</strong> best value reachable from the next state:</p>
$$Q^*(s,a)=r+\gamma\,\max_{a'}Q^*(s',a')$$

<h3>The Q-learning update</h3>
$$Q(s,a)\leftarrow Q(s,a)+\alpha\Big[\underbrace{r+\gamma\max_{a'}Q(s',a')}_{\text{TD target}}-Q(s,a)\Big]$$
<p>An equivalent form, used in the Taxi slides: $Q(s,a) \leftarrow (1-\alpha)\,Q(s,a) + \alpha\,\big(r+\gamma\max_{a'}Q(s',a')\big)$.</p>
<div class="two">
<div class="card"><h5>α: learning rate (0 &lt; α ≤ 1)</h5><p>How much new information overrides old Q-values in each update. α = 1 takes the new estimate entirely. Small α means slow, stable learning.</p></div>
<div class="card"><h5>γ: discount factor (0 ≤ γ ≤ 1)</h5><p>Importance of <strong>future</strong> rewards. γ near 1 values long-term reward. γ = 0 makes the agent consider <strong>only immediate</strong> reward, i.e. <strong>greedy</strong>.</p></div>
</div>

<div class="callout ex"><span class="ttl">Numerical example (α = 0.9, γ = 0.75)</span>
Current Q(s,a) = 2, reward r = 5, best next-state value max Q(s′,a′) = 8.
<ol><li>TD target = 5 + 0.75 × 8 = 5 + 6 = <strong>11</strong></li><li>TD error = 11 − 2 = <strong>9</strong></li><li>New Q = 2 + 0.9 × 9 = 2 + 8.1 = <strong>10.1</strong></li></ol></div>

<div class="vis" data-vis="qupdate"></div>

<details class="check"><summary>Student exercise: α = 0.1, γ = 0.9, Q(s,a) = 0.5, r = −1, max Q(s′,·) = 2. Updated Q?</summary><div><p>Target = −1 + 0.9 × 2 = 0.8. Error = 0.8 − 0.5 = 0.3. New Q = 0.5 + 0.1 × 0.3 = <strong>0.53</strong>.</p></div></details>
<details class="check"><summary>Check yourself: with γ = 0, what does the update become?</summary><div><p>Q ← Q + α(r − Q). The agent only learns about immediate reward and ignores the future, which is greedy behaviour.</p></div></details>
`
        },
        {
            id: 'qtable', title: 'The Q-table',
            html: String.raw`
<p class="lead">A <strong>Q-table</strong> is a lookup table holding a Q-value for every <strong>(state, action)</strong> pair: one <strong>row per state</strong> and one <strong>column per action</strong>. The best action in a state is the column with the highest value.</p>

<h3>Building a Q-table: dog simulator (run, fetch, sit)</h3>
<ol class="steps">
<li><strong>Initialise</strong>: create the table with all values = 0. At first the agent knows nothing.</li>
<li><strong>Choose and perform an action</strong> (e.g. "sit"), using ε-greedy, then observe the outcome.</li>
<li><strong>Get the reward and compute the new Q-value</strong> with the Bellman / Q-learning update, and write it into the table.</li>
<li><strong>Continue</strong> until the episode ends or the table converges. Repeat over many episodes.</li>
</ol>

<div class="tbl-wrap"><table class="tbl"><tr><th>State \ Action</th><th class="num">Run</th><th class="num">Fetch</th><th class="num">Sit</th></tr>
<tr><td>Start</td><td class="num">0</td><td class="num">0</td><td class="num">0</td></tr>
<tr><td>Idle</td><td class="num">0</td><td class="num">0</td><td class="num">0</td></tr>
<tr><td>Wrong action</td><td class="num">0</td><td class="num">0</td><td class="num">0</td></tr>
<tr><td>Correct action</td><td class="num">0</td><td class="num">0</td><td class="num">0</td></tr>
<tr><td>End</td><td class="num">0</td><td class="num">0</td><td class="num">0</td></tr></table></div>
<p class="small muted">Initial table, all zeros. After training, higher numbers mark the better action in each state.</p>

<h3>Try it: Q-learning in a gridworld</h3>
<div class="vis" data-vis="gridworld"></div>
<div class="callout tip"><span class="ttl">What to notice</span>With high ε the agent wanders. As Q-values spread back from the goal (the discount γ makes nearer cells more valuable), the arrows (greedy policy) point along the shortest safe path. Lower γ makes distant rewards fade faster.</div>
`
        },
        {
            id: 'taxi', title: 'Case study: Taxi-v3 self-driving cab',
            html: String.raw`
<p class="lead">Goal: a Smartcab picks up a passenger at one location and drops them off at another. It should drop off at the right place, save passenger time, and respect safety and traffic rules.</p>

<h3>Rewards</h3>
<div class="tbl-wrap"><table class="tbl"><tr><th>Event</th><th class="num">Reward</th><th>Reasoning</th></tr>
<tr><td>Successful drop-off</td><td class="num">+20</td><td>Highly desired behaviour</td></tr>
<tr><td>Illegal pick-up / drop-off</td><td class="num">−10</td><td>Penalise wrong locations</td></tr>
<tr><td>Every time-step (incl. hitting a wall)</td><td class="num">−1</td><td>"Slight" negative, so the taxi prefers arriving late to making wrong moves, and step penalties force the shortest path</td></tr></table></div>

<h3>State space: 500 states</h3>
<ul>
<li>5 × 5 grid → <strong>25</strong> taxi locations (e.g. the taxi is at (row 3, col 1)).</li>
<li>Passenger location: R, G, Y, B or <strong>in the taxi</strong> → <strong>5</strong>.</li>
<li>Destination: R, G, Y, B → <strong>4</strong>. Locations: R(0,0), G(0,4), Y(4,0), B(4,3).</li>
</ul>
$$5\times5\times5\times4 = 500 \text{ states}$$

<h3>Action space: 6 actions</h3>
<p>0 = south, 1 = north, 2 = east, 3 = west, 4 = pickup, 5 = dropoff. Walls ("|") block some moves. Hitting one costs −1 and the taxi doesn't move.</p>

<h3>Encoding a state</h3>
$$\text{state}=((\text{row}\times5+\text{col})\times5+\text{passenger})\times4+\text{destination}$$
<p>Taxi (3,1), passenger at Y (index 2), destination R (index 0): ((3×5+1)×5+2)×4+0 = (16×5+2)×4 = 82×4 = <strong>328</strong>.</p>
<pre><code>state = env.unwrapped.encode(3, 1, 2, 0)   # -> 328
env.unwrapped.s = state</code></pre>

<h3>Gym / Gymnasium interface</h3>
<div class="tbl-wrap"><table class="tbl">
<tr><td><code>env.reset()</code></td><td>Resets the environment and returns a random initial state</td></tr>
<tr><td><code>env.step(action)</code></td><td>Advances one time-step. Returns <strong>observation</strong>, <strong>reward</strong>, <strong>done</strong> (passenger dropped off = end of episode) and <strong>info</strong> (debug data)</td></tr>
<tr><td><code>env.render()</code></td><td>Renders one frame. Taxi yellow = empty, green = carrying a passenger. Blue letter = pick-up, purple = destination</td></tr>
</table></div>

<h3>The reward table P</h3>
<p>Created with the environment: a states × actions matrix. <code>env.P[328]</code> is a dict <code>{action: [(probability, nextstate, reward, done)]}</code>. Probability is always 1.0 here. Movement gives −1, and pickup/dropoff in this state gives −10. In a state where the taxi carries the passenger and is at the destination, dropoff (5) gives +20.</p>

<h3>Q-learning on Taxi</h3>
<p>The Q-table has <strong>500 rows × 6 columns</strong>, the same shape as the reward table but a completely different purpose. It starts at 0 and is learned through experience.</p>
<pre><code>import gymnasium as gym, numpy as np, random
env = gym.make("Taxi-v3")
q_table = np.zeros([env.observation_space.n, env.action_space.n])   # 500 x 6
alpha, gamma, epsilon = 0.1, 0.6, 0.1

for episode in range(100000):
    state, _ = env.reset()
    done = False
    while not done:
        if random.uniform(0, 1) < epsilon:
            action = env.action_space.sample()            # explore
        else:
            action = np.argmax(q_table[state])            # exploit
        next_state, reward, terminated, truncated, _ = env.step(action)
        old = q_table[state, action]
        q_table[state, action] = (1 - alpha) * old + alpha * (reward + gamma * np.max(q_table[next_state]))
        state, done = next_state, terminated or truncated</code></pre>

<div class="callout trap"><span class="ttl">Common misconceptions</span><ul><li>"RL needs labelled data." No, it learns from rewards.</li><li>"The Q-table is the reward table." No, the Q-table holds <em>learned long-term</em> values, while P holds immediate rewards.</li><li>"γ = 0 is best." No, that makes the agent greedy and short-sighted.</li><li>"Always exploit." No, without exploration the agent can't discover better actions.</li></ul></div>

<details class="check"><summary>Check yourself: why is the step penalty −1 rather than −10?</summary><div><p>It should be only a slight push towards short routes. A large step penalty would encourage risky wrong moves (or illegal drop-offs) just to end the episode quickly.</p></div></details>
`
        }
    ],
    notes: String.raw`
<h3>1. Fundamentals</h3>
<p>RL is goal-oriented learning through interaction: an agent acts in an environment to maximise reward. It needs no labels and works with less historical data. It uses a value function based on a policy, and suits sequential decisions with long-term planning. Components: agent, environment, state, action, reward, policy, episode. Dog analogy: dog = agent, house = environment, standing = state, sitting = action, treat = reward. <strong>Credit assignment problem</strong>: with delayed reward, which earlier actions earned it?</p>

<h3>2. Policy & exploration</h3>
<p>A policy π maps states to actions. The optimal policy chooses the action with the highest long-term reward. Exploration tries new actions, and exploitation uses the best known one. <strong>ε-greedy</strong>: random with probability ε, otherwise argmax Q, with ε decaying over time. Q-learning is <strong>off-policy</strong>: it behaves ε-greedily but learns the greedy target.</p>

<h3>3. Q-learning</h3>
<p>Model-free, off-policy and value-based. Learns Q(s,a), the quality of an action in a state. Bellman: $Q^*(s,a)=r+\gamma\max_{a'}Q^*(s',a')$. Update: $Q\leftarrow Q+\alpha[r+\gamma\max Q(s',\cdot)-Q]$, equivalently $(1-\alpha)Q+\alpha(r+\gamma\max Q')$. α is the learning rate (0&lt;α≤1). γ is the discount (0≤γ≤1): γ→1 is far-sighted and γ=0 is greedy. Example: α=0.9, γ=0.75, Q=2, r=5, maxQ′=8 gives 10.1.</p>

<h3>4. Q-table</h3>
<p>One row per state and one column per action, initialised to 0. Loop: choose an action (ε-greedy), act, observe the reward, update with Bellman, repeat until the episode ends. Over many episodes the table converges, and argmax per row gives the policy.</p>

<h3>5. Taxi-v3</h3>
<p>Rewards: +20 correct drop-off, −10 illegal pickup/drop-off, −1 per step. States: 5×5 positions × 5 passenger locations × 4 destinations = <strong>500</strong>. Actions: <strong>6</strong> (S, N, E, W, pickup, dropoff). Encoding: ((row×5+col)×5+pass)×4+dest, so (3,1,2,0) = 328. Gym: reset, step (obs, reward, done, info), render. The reward table P is {action: [(prob, next, reward, done)]}. The Q-table is 500×6.</p>
`,
    subjective: [
        { q: 'Define reinforcement learning and explain how it differs from supervised learning.', m: 5, a: String.raw`<p>Reinforcement learning is a goal-oriented learning method in which an <strong>agent</strong> learns by <strong>interacting with an environment</strong>. It takes actions, receives rewards or penalties, and learns a policy that maximises cumulative long-term reward.</p><p><strong>Differences from supervised learning</strong>: (1) RL needs no labelled input–output pairs, while supervised learning learns from correct labels; (2) RL feedback is a scalar reward that may be <em>delayed</em>, rather than the correct answer for each input; (3) RL involves sequential decisions where actions affect future states, while supervised learning predicts independent samples from a static dataset; (4) RL must balance exploration and exploitation.</p>` },
        { q: 'Using the dog-training analogy, explain agent, environment, state, action, reward and policy.', m: 6, a: String.raw`<ul><li><strong>Agent</strong>: the dog, which learns and makes decisions.</li><li><strong>Environment</strong>: the house, with you in it. Everything the dog interacts with.</li><li><strong>State</strong>: the current situation, e.g. the dog standing while you say a word in a certain tone in the living room.</li><li><strong>Action</strong>: what the dog does to move from one state to another, e.g. going from standing to sitting.</li><li><strong>Reward</strong>: the feedback after the transition, a treat (positive) or a "No" (penalty).</li><li><strong>Policy</strong>: the dog's strategy for choosing an action in a given state in expectation of better outcomes (sitting when it hears "sit").</li></ul>` },
        { q: 'Explain the exploration–exploitation trade-off and the ε-greedy strategy.', m: 5, a: String.raw`<p><strong>Exploration</strong> means trying new or random actions to discover potentially better rewards. <strong>Exploitation</strong> means choosing the action currently believed best (the highest Q-value) to collect reward. Too much exploitation can leave the agent stuck on a sub-optimal policy, while too much exploration wastes reward and never uses the knowledge gained.</p><p><strong>ε-greedy</strong>: with probability ε choose a random action (explore), otherwise choose $\arg\max_a Q(s,a)$ (exploit). ε usually starts high and decays over training, so the agent explores early and exploits once its estimates are reliable.</p>` },
        { q: 'Write the Q-learning update equation and explain each term. Then compute the new Q-value for α = 0.9, γ = 0.75, Q(s,a) = 2, r = 5 and max Q(s′,a′) = 8.', m: 8, a: String.raw`$$Q(s,a)\leftarrow Q(s,a)+\alpha\big[r+\gamma\max_{a'}Q(s',a')-Q(s,a)\big]$$<ul><li>Q(s,a): current estimate of the value of taking action a in state s.</li><li>α: learning rate (0&lt;α≤1), how much the new information overrides the old estimate.</li><li>r: immediate reward received.</li><li>γ: discount factor (0≤γ≤1), the importance of future rewards. γ=0 is greedy and γ→1 is far-sighted.</li><li>max Q(s′,a′): the best estimated value achievable from the next state s′.</li><li>The bracket is the temporal-difference error: target minus current estimate.</li></ul><p><strong>Computation</strong>: target = 5 + 0.75×8 = 11. TD error = 11 − 2 = 9. New Q = 2 + 0.9×9 = <strong>10.1</strong>.</p>` },
        { q: 'Why is Q-learning described as model-free and off-policy?', m: 4, a: String.raw`<p><strong>Model-free</strong>: it doesn't need (or learn) a model of the environment's transition probabilities and reward function. It learns Q-values directly from experienced transitions (s, a, r, s′) using the update equation, so it is value-based.</p><p><strong>Off-policy</strong>: the policy it learns about (the greedy policy, through the max over next actions in the update) differs from the policy it uses to act (e.g. ε-greedy with random exploratory actions). It can learn the optimal policy while behaving differently, so there is no actual need to follow a fixed policy.</p>` },
        { q: 'For the Taxi-v3 environment, explain how the number of states (500) and actions (6) are obtained, and describe the reward structure.', m: 7, a: String.raw`<p><strong>States</strong>: the grid is 5×5, so there are 25 taxi positions. The passenger can be at one of 4 locations (R, G, Y, B) or inside the taxi, giving 5 options. The destination is one of 4 locations. Total = 5 × 5 × 5 × 4 = <strong>500</strong> states.</p><p><strong>Actions</strong>: 6: south (0), north (1), east (2), west (3), pickup (4), dropoff (5).</p><p><strong>Rewards</strong>: +20 for a successful drop-off at the correct destination; −10 for an illegal pickup or drop-off; −1 for every time-step (including hitting a wall, where the taxi doesn't move). The small step penalty pushes the agent to the shortest route without encouraging reckless wrong moves.</p>` },
        { q: 'Describe the steps to construct a Q-table.', m: 4, a: String.raw`<ol><li>Create the Q-table with one row per state and one column per action, with all values initialised to 0.</li><li>Choose an action for the current state (e.g. ε-greedy) and perform it in the environment.</li><li>Observe the reward and next state, compute the new Q-value with the Bellman / Q-learning update, and store it in the table.</li><li>Continue until the episode ends, then repeat over many episodes until the values converge. The best action in each state is the one with the highest Q-value.</li></ol>` }
    ],
    mcq: [
        { q: 'In reinforcement learning, the learner and decision-maker is called the:', o: ['Environment', 'Agent', 'Policy', 'Reward'], a: 1, e: 'The agent acts in the environment.' },
        { q: 'Reinforcement learning differs from supervised learning because it:', o: ['Requires labelled data', 'Learns from rewards through interaction, with no labels', 'Only clusters data', 'Cannot be used for games'], a: 1, e: 'Feedback is a reward signal, not the correct answer.' },
        { q: 'The agent\'s strategy that maps states to actions is the:', o: ['Reward', 'Episode', 'Policy', 'Q-table size'], a: 2, e: 'Policy π(s) → a.' },
        { q: 'A complete run from start to a terminal state is called:', o: ['An epoch', 'An episode', 'A batch', 'A transition'], a: 1, e: 'For example, one complete game.' },
        { q: 'Deciding which earlier actions caused a delayed reward is the:', o: ['Exploration problem', 'Credit assignment problem', 'Curse of dimensionality', 'Vanishing gradient'], a: 1, e: 'Rewards often arrive after many actions.' },
        { q: 'Choosing the action with the highest known Q-value is:', o: ['Exploration', 'Exploitation', 'Discounting', 'Backpropagation'], a: 1, e: 'Exploration tries new or random actions.' },
        { q: 'In ε-greedy with ε = 0.2, the agent chooses a random action:', o: ['80% of the time', '20% of the time', 'Never', 'Always'], a: 1, e: 'Otherwise it exploits.' },
        { q: 'Q-learning is best described as:', o: ['Model-based and on-policy', 'Model-free and off-policy', 'Supervised and parametric', 'Unsupervised clustering'], a: 1, e: 'It learns Q directly and its target uses the greedy max.' },
        { q: 'Q(s, a) represents:', o: ['The immediate reward only', 'The quality (expected future reward) of taking action a in state s', 'The probability of state s', 'The number of actions'], a: 1, e: 'Higher Q means a better action.' },
        { q: 'In the Q-learning update, α is the:', o: ['Discount factor', 'Learning rate', 'Exploration rate', 'Reward'], a: 1, e: 'It controls how much new information overrides the old.' },
        { q: 'A discount factor γ = 0 makes the agent:', o: ['Far-sighted', 'Consider only immediate reward (greedy)', 'Explore randomly', 'Stop learning'], a: 1, e: 'Future rewards get zero weight.' },
        { q: 'α = 0.5, γ = 0.9, Q = 4, r = 2, max Q(s′) = 10. New Q =', o: ['5.5', '7.5', '11', '8'], a: 1, e: 'Target = 2 + 9 = 11. New = 4 + 0.5 × (11 − 4) = 7.5.' },
        { q: 'α = 0.9, γ = 0.75, Q = 2, r = 5, max Q(s′) = 8. New Q =', o: ['10.1', '11', '9', '8.1'], a: 0, e: 'Target 11, error 9, so 2 + 0.9 × 9 = 10.1.' },
        { q: 'The Q-table has:', o: ['One row per action and one column per state', 'One row per state and one column per action', 'Only one row', 'Rows for episodes'], a: 1, e: 'Taxi-v3 has 500 × 6.' },
        { q: 'When constructing a Q-table, the initial values are usually:', o: ['Random large numbers', 'All 0', 'All 1', 'Equal to the rewards'], a: 1, e: 'The agent starts with no knowledge.' },
        { q: 'How many states does Taxi-v3 have?', o: ['25', '100', '500', '600'], a: 2, e: '5 × 5 × 5 × 4 = 500.' },
        { q: 'How many actions does Taxi-v3 have?', o: ['4', '5', '6', '8'], a: 2, e: 'South, north, east, west, pickup, dropoff.' },
        { q: 'In Taxi-v3, an illegal pickup or drop-off gives a reward of:', o: ['+20', '−1', '−10', '0'], a: 2, e: '+20 for a successful drop-off, −1 per step.' },
        { q: 'Why does Taxi-v3 give −1 per time-step?', o: ['To punish all movement equally hard', 'To push the agent towards the shortest path without encouraging reckless moves', 'Because walls are illegal', 'To end episodes early'], a: 1, e: 'It is a "slight" negative.' },
        { q: 'env.step(action) returns:', o: ['Only the reward', 'Observation, reward, done and info', 'The Q-table', 'A rendered frame'], a: 1, e: 'Done marks the end of the episode (successful drop-off).' },
        { q: 'The encoded Taxi state for taxi (3,1), passenger index 2, destination 0 is:', o: ['82', '164', '328', '500'], a: 2, e: '((3×5+1)×5+2)×4+0 = 328.' },
        { q: 'The Q-table and the reward table P in Taxi-v3:', o: ['Are identical', 'Have the same dimensions but different purposes', 'Have different dimensions', 'Are both fixed'], a: 1, e: 'P holds immediate rewards. Q holds learned long-term values.' }
    ]
});
