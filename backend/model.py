import torch
import torch.nn as nn

class GradeRegressionNN(nn.Module):
    def __init__(self, input_size=5):
        super(GradeRegressionNN, self).__init__()
        # Simple 2-layer MLP for grade regression
        self.network = nn.Sequential(
            nn.Linear(input_size, 16),
            nn.ReLU(),
            nn.Linear(16, 8),
            nn.ReLU(),
            nn.Linear(8, 1) # Single output for predicted grade
        )
    
    def forward(self, x):
        return self.network(x)

def get_model(input_size=5):
    model = GradeRegressionNN(input_size=input_size)
    # In a real scenario, we would load weights here.
    # For this autonomous demo, we initialized with random weights
    # or simple linear logic if weights are missing.
    return model
