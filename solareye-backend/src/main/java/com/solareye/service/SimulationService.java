package com.solareye.service;

public interface SimulationService {

    /**
     * Generate and save a simulated sensor reading.
     */
    void generateSimulatedData();

    /**
     * Enable/disable the simulation engine.
     */
    void setEnabled(boolean enabled);

    /**
     * Check if the simulation engine is currently active.
     */
    boolean isEnabled();
}
